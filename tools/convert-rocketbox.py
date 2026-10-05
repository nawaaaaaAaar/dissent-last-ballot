"""Convert selected MIT Rocketbox adults and compatible locomotion into glTF.

Run with Blender's bpy Python. Original files and the MIT licence are retained.
Motion is retargeted by bone-space orientation, with root XY motion removed.
"""
import os, math, argparse
import bpy
from mathutils import Matrix, Vector

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE=os.path.join(ROOT,'art','rocketbox-source')
CLIPS=[('Idle','m_idle_breathe_01.max.fbx'),('Walk','m_walk_neutral_01.max.fbx'),('Run','m_run_neutral_01.max.fbx')]

def convert(kind,name,output=None):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    folder=os.path.join(SOURCE,kind)
    bpy.ops.import_scene.fbx(filepath=os.path.join(folder,name+'.fbx'))
    arm=next(o for o in bpy.data.objects if o.type=='ARMATURE')
    mesh=next(o for o in bpy.data.objects if o.type=='MESH')
    original=set(bpy.data.objects)
    arm.animation_data_clear()
    arm.animation_data_create()
    base_z=arm.location.z
    for m in mesh.data.materials:
        p=m.node_tree.nodes.get('Principled BSDF')
        p.inputs['Base Color'].default_value=(1,1,1,1)
        p.inputs['Roughness'].default_value=.82
        p.inputs['Metallic'].default_value=0
        for socket in ['Specular IOR Level','Roughness']:
            for link in list(p.inputs[socket].links):m.node_tree.links.remove(link)
        for n in m.node_tree.nodes:
            if n.type=='TEX_IMAGE' and n.image:
                path=os.path.join(folder,os.path.basename(n.image.filepath))
                if os.path.isfile(path):
                    n.image.filepath=path;n.image.reload()
                    n.image.scale(1024,1024)
                    if 'normal' in path:n.image.colorspace_settings.name='Non-Color'
                    n.image.pack()
                else:
                    for link in list(n.outputs[0].links):m.node_tree.links.remove(link)
        if 'opacity' in m.name:
            m.surface_render_method='DITHERED'
            m.use_backface_culling=False
    # Bake orientation onto the avatar's own rest rig rather than copying
    # incompatible local keys from FBX files with a different reference pose.
    for label,filename in CLIPS:
        before=set(bpy.data.objects)
        bpy.ops.import_scene.fbx(filepath=os.path.join(SOURCE,'animations',filename))
        added=set(bpy.data.objects)-before
        src=next(o for o in added if o.type=='ARMATURE')
        first,last=map(int,src.animation_data.action.frame_range)
        bpy.context.scene.frame_set(first)
        src_z=src.location.z
        action=bpy.data.actions.new(label)
        arm.animation_data.action=action
        for f in range(first,last+1):
            bpy.context.scene.frame_set(f)
            for bone in arm.pose.bones:
                if bone.name not in src.pose.bones:continue
                rest=bone.bone
                if bone.parent:
                    offset=rest.parent.matrix_local.inverted()@rest.head_local
                    head=bone.parent.matrix@offset
                else:head=rest.head_local
                q=src.pose.bones[bone.name].matrix.to_quaternion()
                bone.matrix=Matrix.Translation(head)@q.to_matrix().to_4x4()
                bone.rotation_mode='QUATERNION'
                bone.keyframe_insert('rotation_quaternion',frame=f-first)
            arm.location.z=base_z+(src.location.z-src_z)
            arm.keyframe_insert('location',frame=f-first,index=2)
        arm.animation_data.action=None
        track=arm.animation_data.nla_tracks.new();track.name=label
        strip=track.strips.new(label,0,action);strip.action_frame_start=0;strip.action_frame_end=last-first
        strip.use_auto_blend=False
        for o in added:bpy.data.objects.remove(o,do_unlink=True)
    # Export only the selected rig and its clothed mesh.
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True);mesh.select_set(True)
    bpy.context.scene.frame_set(0)
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(ROOT,'docs','assets',(output or kind)+'-animated.glb'),
        export_format='GLB',use_selection=True,export_animations=True,
        export_animation_mode='NLA_TRACKS',export_force_sampling=True,
        export_frame_range=False,export_image_format='WEBP',export_image_quality=88,
        export_optimize_animation_size=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art',(output or kind)+'-animated.blend'))
    print('Exported',kind,'with',len(mesh.data.polygons),'polygons and Idle/Walk/Run clips')

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--delhi',action='store_true')
    opt=parser.parse_args()
    if opt.delhi:
        convert('male-delhi','Male_Adult_15')
        convert('female-delhi','Female_Adult_06')
    else:
        convert('male','Male_Adult_02')
        convert('female','Female_Adult_04')
