"""Fuente Blender editable de la misma geometría, rig, materiales y clips exportados desde el juego."""
import bpy
import sys
import json
import math
from pathlib import Path
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
salida = Path(args[0]).resolve()
verificar = len(args) > 1 and args[1] == 'verificar'

if not verificar:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.render.fps = 30
    bpy.ops.import_scene.gltf(filepath=str(salida / 'tasogare.glb'), import_pack_images=True)
    escena = bpy.context.scene
    escena.name = 'Tasogare_normal'
    escena.unit_settings.system = 'METRIC'
    escena.unit_settings.scale_length = 1.0
    escena.render.fps = 30
    escena['referencia'] = 'Hoja de ocho vistas del usuario, forma normal'
    escena['ojo_rojo'] = 'Izquierdo del personaje; +X antes de la conversión de ejes glTF'
    escena['fuente_geometrica'] = 'js/48-tasogare-modelo.js'
    escena['animaciones'] = 'Nueve acciones en las pistas NLA. Selecciona y activa una para editarla.'
    escena['variante_gigante'] = 'Separada. Requiere su propia hoja de referencia.'
    for obj in escena.objects:
        if obj.animation_data:
            obj.animation_data.action = None
            for track in obj.animation_data.nla_tracks:
                track.mute = True
        if obj.type == 'ARMATURE':
            obj.show_in_front = True
            obj.data.display_type = 'STICK'
    for action in bpy.data.actions:
        action.use_fake_user = True
    escena.world = bpy.data.worlds.new('Estudio_ocaso')
    escena.world.use_nodes = True
    escena.world.node_tree.nodes.get('Background').inputs['Color'].default_value = (.12, .15, .20, 1)
    escena.world.node_tree.nodes.get('Background').inputs['Strength'].default_value = .35
    for name, loc, energy, color, size in [
        ('Luz_principal', (3, -4, 5), 600, (1, .83, .65), 4),
        ('Luz_contorno', (-3, 2, 4), 800, (.6, .78, 1), 3),
    ]:
        data = bpy.data.lights.new(name, 'AREA')
        data.energy, data.color, data.shape, data.size = energy, color, 'DISK', size
        luz = bpy.data.objects.new(name, data)
        escena.collection.objects.link(luz)
        luz.location = loc
        luz.rotation_euler = (Vector((0, 0, 1.3)) - luz.location).to_track_quat('-Z', 'Y').to_euler()
    data = bpy.data.cameras.new('Camara_revision')
    camara = bpy.data.objects.new('Camara_revision', data)
    escena.collection.objects.link(camara)
    camara.location = (4.2, -6.5, 3.2)
    camara.rotation_euler = (Vector((0, 0, 1.25)) - camara.location).to_track_quat('-Z', 'Y').to_euler()
    data.lens = 58
    escena.camera = camara
    escena.render.resolution_x, escena.render.resolution_y = 1100, 1100
    referencia = salida / 'referencia-ocho-vistas.png'
    if referencia.exists():
        imagen = bpy.data.images.load(str(referencia), check_existing=True)
        plano = bpy.data.objects.new('Referencia_ocho_vistas', None)
        escena.collection.objects.link(plano)
        plano.empty_display_type = 'IMAGE'
        plano.data = imagen
        plano.empty_display_size = 4
        plano.location = (3, 1, 1.4)
        plano.hide_render = True
    bpy.ops.file.pack_all()
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(salida / 'tasogare.blend'))

armaduras = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE']
acciones = [a.name for a in bpy.data.actions]
informe = {
    'versionBlender': bpy.app.version_string,
    'archivo': 'tasogare.blend',
    'reabierto': verificar,
    'mallas': len([o for o in bpy.context.scene.objects if o.type == 'MESH']),
    'armaduras': [{'nombre': o.name, 'huesos': len(o.data.bones)} for o in armaduras],
    'acciones': acciones,
    'imagenes': [{'nombre': i.name, 'tamano': list(i.size), 'empaquetada': bool(i.packed_file)}
                 for i in bpy.data.images if i.source == 'FILE'],
    'unidad': bpy.context.scene.unit_settings.system,
}
assert armaduras, 'Falta el esqueleto'
assert len(acciones) >= 9, 'Faltan animaciones'
assert any(tuple(i.size) == (1024, 1024) and i.packed_file for i in bpy.data.images), 'Falta el atlas empaquetado'
with open(salida / ('revision-blender.json' if verificar else 'fuente-blender.json'), 'w', encoding='utf8') as f:
    json.dump(informe, f, ensure_ascii=False, indent=2)
print(json.dumps(informe, ensure_ascii=False))
