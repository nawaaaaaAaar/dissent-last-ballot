"""Reproducible adaptation: existing licensed human, authored uniform accessories."""
import os,math
import bpy
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'docs','assets')
for stem in ['delhi-facade-atlas','dissent-menu-art','dissent-victory-art']:
    Image.open(os.path.join(OUT,stem+'.png')).save(os.path.join(OUT,stem+'.webp'),quality=87)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(OUT,'male-animated.glb'))
for o in list(bpy.data.objects):
    if o.name=='Icosphere':bpy.data.objects.remove(o,do_unlink=True)
arm=next(o for o in bpy.data.objects if o.type=='ARMATURE')
for m in bpy.data.materials:
    if m.name.startswith('m003_body') and m.use_nodes:
        p=m.node_tree.nodes.get('Principled BSDF')
        # Tint body texture through multiply, preserving baked cloth variation.
        links=list(p.inputs['Base Color'].links)
        if links:
            src=links[0].from_socket
            node=m.node_tree.nodes.new('ShaderNodeMixRGB');node.blend_type='MULTIPLY'
            node.inputs[0].default_value=1;node.inputs[2].default_value=(.64,.48,.29,1)
            m.node_tree.links.new(src,node.inputs[1]);m.node_tree.links.new(node.outputs[0],p.inputs['Base Color'])
        p.inputs['Roughness'].default_value=.86
def mat(name,color):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(*color,1)
    return m
khaki=mat('Khaki cotton',(.46,.35,.20));dark=mat('Leather webbing',(.055,.04,.027))
def accessory(name,location,scale,material,bone,kind='cube'):
    if kind=='cap':bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=10,location=location)
    else:bpy.ops.mesh.primitive_cube_add(size=1,location=location)
    o=bpy.context.object;o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    world=o.matrix_world.copy();o.parent=arm;o.parent_type='BONE';o.parent_bone=bone;o.matrix_world=world
accessory('Uniform cap',(0,-.01,1.76),(.105,.115,.045),khaki,'Bip01 Head','cap')
accessory('Cap peak',(0,-.13,1.75),(.18,.10,.015),dark,'Bip01 Head')
accessory('Duty belt',(0,0,.96),(.30,.23,.045),dark,'Bip01 Pelvis')
accessory('Left epaulette',(.14,0,1.48),(.09,.12,.02),khaki,'Bip01 Spine2')
accessory('Right epaulette',(-.14,0,1.48),(.09,.12,.02),khaki,'Bip01 Spine2')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art','police-review.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'police-review.glb'),export_format='GLB',export_animations=True)
