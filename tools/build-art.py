"""Reproducible Blender adaptation of credited CC0 meshes, not AI video."""
import argparse, math, os
import bpy, bmesh
from mathutils import Vector

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'docs','assets')
args=argparse.ArgumentParser()
args.add_argument('mode',choices=['human','tree'])
args.add_argument('--tree-source',default='/home/user/workspace/art-source/tree.blend')
args.add_argument('--leaf-ratio',type=float,default=.35)
args.add_argument('--tree-output',default='tree-delhi-high.glb')
opt=args.parse_args()

def material(name,color):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=.85
    return m

def human():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(OUT,'courier-base.glb'))
    base=bpy.data.objects['SuperHero_Male'];arm=bpy.data.objects['Armature']
    for o in bpy.data.objects:
        if o.type=='MESH' and o.name!='Icosphere':
            for p in o.data.polygons:p.use_smooth=True
    shirt=material('Cotton canvas',(.53,.20,.09))
    denim=material('Indigo denim',(.05,.075,.12))
    trim=material('Dark stitching',(.025,.032,.037))
    groups={g.index:g.name for g in base.vertex_groups}
    def garment(name,region,mat,offset):
        obj=base.copy();obj.data=base.data.copy();bpy.context.collection.objects.link(obj);obj.name=name
        bm=bmesh.new();bm.from_mesh(obj.data);deform=bm.verts.layers.deform.active
        remove=[]
        for v in bm.verts:
            ws=dict(v[deform].items());dominant=groups.get(max(ws,key=ws.get),'') if ws else ''
            if not region(dominant,v.co):remove.append(v)
        bmesh.ops.delete(bm,geom=remove,context='VERTS')
        bm.to_mesh(obj.data);bm.free()
        obj.data.materials.clear();obj.data.materials.append(mat)
        for a in list(obj.data.color_attributes):obj.data.color_attributes.remove(a)
        bpy.context.view_layer.objects.active=obj;obj.select_set(True)
        # A separate smoothed cloth shell removes the painted-anatomy appearance.
        sm=obj.modifiers.new('Tailored cloth smoothing','SMOOTH');sm.factor=.8;sm.iterations=9
        bpy.ops.object.modifier_apply(modifier=sm.name)
        for v in obj.data.vertices:v.co+=v.normal*offset
        solid=obj.modifiers.new('Hem thickness','SOLIDIFY');solid.thickness=.004
        bpy.ops.object.modifier_apply(modifier=solid.name)
        for p in obj.data.polygons:p.use_smooth=True
        obj.select_set(False)
        return obj
    garment('Shirt',lambda n,v: any(t in n for t in ['spine','clavicle','upperarm','lowerarm']) or (n=='pelvis' and v.z>.93),shirt,.04)
    garment('Trousers',lambda n,v: any(t in n for t in ['thigh','calf']) or n=='pelvis',denim,.033)
    def rigged_primitive(name,verts,faces,mat,bone):
        mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
        obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);obj.data.materials.append(mat)
        g=obj.vertex_groups.new(name=bone);g.add(list(range(len(verts))),1,'REPLACE')
        mod=obj.modifiers.new('Character skeleton','ARMATURE');mod.object=arm;obj.parent=arm
        for p in mesh.polygons:p.use_smooth=True
        return obj
    # Raised collar and centre placket are real geometry, with skeleton weights.
    verts=[]
    for h,rx,ry in [(1.54,.105,.08),(1.59,.08,.06)]:
        for i in range(24):
            a=i*math.tau/24;verts.append((math.cos(a)*rx,math.sin(a)*ry,h))
    rigged_primitive('Collar',verts,[(i,(i+1)%24,(i+1)%24+24,i+24) for i in range(24)],shirt,'neck_01')
    rigged_primitive('Placket',[(-.016,-.174,1.04),(.016,-.174,1.04),(.016,-.174,1.5),(-.016,-.174,1.5)],[(0,1,2,3)],shirt,'spine_02')
    for i in range(6):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=.006,location=(0,-.182,1.08+i*.069))
        button=bpy.context.object;button.name='Button';button.data.materials.append(trim)
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        vg=button.vertex_groups.new(name='spine_02');vg.add(list(range(len(button.data.vertices))),1,'REPLACE')
        mod=button.modifiers.new('Character skeleton','ARMATURE');mod.object=arm;button.parent=arm
    # Merge same-material pieces to reduce per-character browser draw calls.
    for names,final_name in [(['Shirt','Collar','Placket'],'Shirt'),([o.name for o in bpy.data.objects if o.name.startswith('Button')],'Buttons')]:
        bpy.ops.object.select_all(action='DESELECT')
        selected=[bpy.data.objects[n] for n in names]
        for o in selected:o.select_set(True)
        bpy.context.view_layer.objects.active=selected[0];bpy.ops.object.join();selected[0].name=final_name
    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.context.scene.objects:
        if o.type in ['MESH','ARMATURE'] and o.name!='Icosphere':o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'courier-clothed.glb'),export_format='GLB',use_selection=True,export_animations=False,export_yup=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art','courier-clothed.blend'))

def tree():
    bpy.ops.wm.open_mainfile(filepath=opt.tree_source)
    target=bpy.data.objects['tree_small_02_LOD1']
    print('Tree material slots',[(s.name) for s in target.material_slots])
    # Relink diffuse/alpha images and discard unused high-resolution normal resources.
    texture_dir=os.path.join(os.path.dirname(opt.tree_source),'textures')
    for m in target.data.materials:
        if not m or not m.use_nodes:continue
        p=m.node_tree.nodes.get('Principled BSDF')
        if p:
            for socket in ['Normal','Roughness']:
                for link in list(p.inputs[socket].links):m.node_tree.links.remove(link)
            p.inputs['Roughness'].default_value=.91
        for n in m.node_tree.nodes:
            if n.type=='TEX_IMAGE' and n.image:
                path=os.path.join(texture_dir,os.path.basename(n.image.filepath))
                if os.path.exists(path):n.image.filepath=path;n.image.reload()
        m.surface_render_method='DITHERED'
    bpy.ops.object.select_all(action='DESELECT');target.select_set(True);bpy.context.view_layer.objects.active=target
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.separate(type='MATERIAL');bpy.ops.object.mode_set(mode='OBJECT')
    pieces=list(bpy.context.selected_objects)
    for obj in pieces:
        bpy.context.view_layer.objects.active=obj
        name=obj.data.materials[0].name
        dec=obj.modifiers.new('Material-aware browser LOD','DECIMATE');dec.ratio=opt.leaf_ratio if 'leaves' in name else .08
        bpy.ops.object.modifier_apply(modifier=dec.name)
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);obj.location=(0,0,0)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,opt.tree_output),export_format='GLB',use_selection=True,export_animations=False,export_image_format='AUTO')
    print('Exported foliage-preserving browser tree',sum(len(o.data.polygons) for o in pieces),'polygons')

os.makedirs(os.path.join(ROOT,'art'),exist_ok=True)
human() if opt.mode=='human' else tree()
