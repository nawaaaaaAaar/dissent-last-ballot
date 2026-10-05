"""Create a smaller licensed tree adaptation for the city renderer."""
import bpy,os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path=os.path.join(root,'docs','assets','tree-review.glb')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)
for o in bpy.data.objects:
    if o.type!='MESH':continue
    bpy.context.view_layer.objects.active=o
    d=o.modifiers.new('City foliage LOD','DECIMATE');d.ratio=.12
    bpy.ops.object.modifier_apply(modifier=d.name)
for i in bpy.data.images:
    if i.size[0]>768:i.scale(768,768)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'art','tree-review.blend'))
bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',export_animations=False)
