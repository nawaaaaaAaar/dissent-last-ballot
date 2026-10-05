"""Original short-hair adaptation of the licensed generic kurta avatar.

Removes the source cap geometry rather than using a religious costume as a
shortcut for nationality. The fictional cast's Indian identity is narrative.
Run after convert-rocketbox.py --delhi with Blender's bpy environment.
"""
import os,math
import bpy,bmesh
import numpy as np
from PIL import Image
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'art','male-delhi-animated.blend'))
bpy.context.scene.frame_set(0)
base=next(o for o in bpy.data.objects if o.type=='MESH')
arm=next(o for o in bpy.data.objects if o.type=='ARMATURE')
bm=bmesh.new();bm.from_mesh(base.data)
faces=[f for f in bm.faces if sum((base.matrix_world@v.co).z for v in f.verts)/len(f.verts)>1.746]
bmesh.ops.delete(bm,geom=faces,context='FACES');bm.to_mesh(base.data);bm.free()
vertices=[];faces=[];segments=32;rings=9
for r in range(rings):
    t=r/(rings-1)*math.pi/2
    for i in range(segments):
        angle=i/segments*math.tau
        wave=.0015*math.sin(angle*12+t*7)
        vertices.append((.092*math.cos(t)*math.cos(angle),
                         -.015+.112*math.cos(t)*math.sin(angle),
                         1.736+.077*math.sin(t)+wave))
for r in range(rings-1):
    for i in range(segments):
        a=r*segments+i;b=r*segments+(i+1)%segments
        faces.append((a,b,b+segments,a+segments))
mesh=bpy.data.meshes.new('Original short hair');mesh.from_pydata(vertices,[],faces);mesh.update()
hair=bpy.data.objects.new('Student short hair',mesh);bpy.context.collection.objects.link(hair)
hair.parent=arm;hair.matrix_world.identity()
material=bpy.data.materials.new('Short dark hair');material.use_nodes=True
bsdf=material.node_tree.nodes.get('Principled BSDF')
bsdf.inputs['Base Color'].default_value=(.027,.019,.014,1);bsdf.inputs['Roughness'].default_value=.85
mesh.materials.append(material)
group=hair.vertex_groups.new(name='Bip01 Head');group.add(list(range(len(vertices))),1,'REPLACE')
modifier=hair.modifiers.new('Head skeleton','ARMATURE');modifier.object=arm
for p in mesh.polygons:p.use_smooth=True
bpy.ops.object.select_all(action='DESELECT')
for o in [base,hair,arm]:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'docs','assets','male-delhi-animated.glb'),
    export_format='GLB',use_selection=True,export_animations=True,
    export_animation_mode='NLA_TRACKS',export_force_sampling=True,
    export_frame_range=False,export_image_format='WEBP',export_image_quality=88)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art','student-delhi-animated.blend'))

# Keep source textures intact. Bake a dark-hair derivative into the earlier
# casual woman's separate head/hair materials, not a whole-face colour tint.
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'art','female-animated.blend'))
for kind in ['head','opacity']:
    source=os.path.join(ROOT,'art','rocketbox-source','female',f'f004_{kind}_color.tga')
    pixels=np.array(Image.open(source).convert('RGBA'))
    h,w=pixels.shape[:2];yy,xx=np.mgrid[0:h,0:w];u=xx/w;v=yy/h
    mask=np.ones((h,w),dtype=bool) if kind=='opacity' else (
        (v<.12+.55*np.abs(u-.5)**1.5)|((u<.20)&(v<.40))|((u>.80)&(v<.40))|((u>.65)&(v>.65)))
    light=np.mean(pixels[:,:,:3],axis=2)/180
    for channel,value in enumerate([44,32,24]):
        pixels[:,:,channel][mask]=np.clip(value*light[mask],0,255).astype(np.uint8)
    target=os.path.join(ROOT,'art',f'female-delhi-{kind}.png')
    Image.fromarray(pixels).save(target)
    image=bpy.data.images.load(target);image.scale(1024,1024);image.pack()
    for mat in bpy.data.materials:
        if mat.name!=f'f004_{kind}':continue
        for node in mat.node_tree.nodes:
            if node.type=='TEX_IMAGE' and node.image and '_color' in node.image.name:node.image=image
arm=next(o for o in bpy.data.objects if o.type=='ARMATURE')
base=next(o for o in bpy.data.objects if o.type=='MESH')
bpy.ops.object.select_all(action='DESELECT')
for o in [base,arm]:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'docs','assets','female-animated.glb'),
    export_format='GLB',use_selection=True,export_animations=True,
    export_animation_mode='NLA_TRACKS',export_force_sampling=True,
    export_frame_range=False,export_image_format='WEBP',export_image_quality=88)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art','female-casual-delhi.blend'))
