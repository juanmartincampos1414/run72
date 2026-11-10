"""RUN / maestro de identidad. Ejecutar: blender -b --python crear_escena.py
Geometría derivada del original vectorial Compacta A; sin tipografía sustitutiva.
"""
import bpy, math, os, sys, json
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
mode='production'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0
S=bpy.context.scene
S.render.engine='CYCLES';S.cycles.device='CPU';S.cycles.samples=48
S.cycles.use_denoising=True;S.cycles.max_bounces=12;S.cycles.transmission_bounces=10
S.render.threads_mode='FIXED';S.render.threads=8
S.render.resolution_x=2000;S.render.resolution_y=1250;S.render.resolution_percentage=100
S.render.image_settings.file_format='PNG';S.render.film_transparent=False
S.view_settings.view_transform='AgX';S.view_settings.look='AgX - Medium High Contrast';S.view_settings.exposure=0
S.world=bpy.data.worlds.new('RUN / ambiente nogal');S.world.use_nodes=True
S.world.node_tree.nodes['Background'].inputs[0].default_value=(.22,.16,.11,1);S.world.node_tree.nodes['Background'].inputs[1].default_value=.7

def srgb(h):
 a=[int(h[i:i+2],16)/255 for i in (1,3,5)]
 return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in a)+(1,)
def mat(name,h,rough,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=srgb(h);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 return m,p
cream,p=mat('RUN / crema cerámica satinada','#FFECD5',.31)
p.inputs['Coat Weight'].default_value=.12;p.inputs['Coat Roughness'].default_value=.3
# Sólo microtextura, sin alterar la silueta o la cara de las letras.
n=cream.node_tree.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=210;n.inputs['Detail'].default_value=2
b=cream.node_tree.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=.06;b.inputs['Distance'].default_value=.012
cream.node_tree.links.new(n.outputs['Fac'],b.inputs['Height']);cream.node_tree.links.new(b.outputs['Normal'],p.inputs['Normal'])
glass=bpy.data.materials.new('RUN / cristal ámbar');glass.use_nodes=True
nt=glass.node_tree;nt.nodes.clear();output=nt.nodes.new('ShaderNodeOutputMaterial')
g=nt.nodes.new('ShaderNodeBsdfGlass');g.inputs['Color'].default_value=srgb('#FFF5E8');g.inputs['Roughness'].default_value=.018;g.inputs['IOR'].default_value=1.46
trans=nt.nodes.new('ShaderNodeBsdfTranslucent');trans.inputs['Color'].default_value=srgb('#FFE9D4');mix=nt.nodes.new('ShaderNodeMixShader');mix.inputs[0].default_value=.025;nt.links.new(g.outputs[0],mix.inputs[1]);nt.links.new(trans.outputs[0],mix.inputs[2]);nt.links.new(mix.outputs[0],output.inputs['Surface'])
v=nt.nodes.new('ShaderNodeVolumeAbsorption');v.inputs['Color'].default_value=srgb('#F5B360');v.inputs['Density'].default_value=.12
nt.links.new(v.outputs[0],output.inputs['Volume'])
floor,p=mat('RUN / suelo nogal pulido','#28170F',.38)
p.inputs['Coat Weight'].default_value=.08;p.inputs['Coat Roughness'].default_value=.4
geo=floor.node_tree.nodes.new('ShaderNodeNewGeometry');sep=floor.node_tree.nodes.new('ShaderNodeSeparateXYZ');grad=floor.node_tree.nodes.new('ShaderNodeMapRange');grad.inputs['From Min'].default_value=0;grad.inputs['From Max'].default_value=2;grad.inputs['To Min'].default_value=.38;grad.inputs['To Max'].default_value=1;grad.clamp=True;floor.node_tree.links.new(geo.outputs['Position'],sep.inputs[0]);floor.node_tree.links.new(sep.outputs['Z'],grad.inputs['Value']);floor.node_tree.links.new(grad.outputs['Result'],p.inputs['Roughness'])
wallgrad=floor.node_tree.nodes.new('ShaderNodeMapRange');wallgrad.inputs['From Min'].default_value=.05;wallgrad.inputs['From Max'].default_value=2.5;wallgrad.inputs['To Min'].default_value=0;wallgrad.inputs['To Max'].default_value=1;wallgrad.clamp=True
floor.node_tree.links.new(sep.outputs['Z'],wallgrad.inputs['Value']);wallmix=floor.node_tree.nodes.new('ShaderNodeMixRGB');wallmix.inputs[1].default_value=srgb('#28170F');wallmix.inputs[2].default_value=srgb('#553620');floor.node_tree.links.new(wallgrad.outputs['Result'],wallmix.inputs[0]);floor.node_tree.links.new(wallmix.outputs[0],p.inputs['Base Color'])
n=floor.node_tree.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=4;n.inputs['Detail'].default_value=3;n.inputs['Roughness'].default_value=.65
mapping=floor.node_tree.nodes.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY';mapping.inputs[1].default_value=(.65,18,3)
t=floor.node_tree.nodes.new('ShaderNodeTexCoord');floor.node_tree.links.new(t.outputs['Generated'],mapping.inputs[0]);floor.node_tree.links.new(mapping.outputs['Vector'],n.inputs['Vector'])
b=floor.node_tree.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=.11;b.inputs['Distance'].default_value=.025;floor.node_tree.links.new(n.outputs['Fac'],b.inputs['Height']);floor.node_tree.links.new(b.outputs['Normal'],p.inputs['Normal'])
# Importar geometría base y soldar vértices por posición. Ejes glTF: Y arriba; Blender: Z arriba.
data=json.loads((HERE/'geometria.json').read_text())
for d in data:
 if d['name'] in ['Suelo','Nucleo_facetado']:continue
 verts=[(x,-z,y) for x,y,z in d['p']];faces=[(i,i+1,i+2) for i in range(0,len(verts),3)]
 mesh=bpy.data.meshes.new(d['name']);mesh.from_pydata(verts,[],faces);mesh.update()
 ob=bpy.data.objects.new(d['name'],mesh);S.collection.objects.link(ob);bpy.context.view_layer.objects.active=ob;ob.select_set(True)
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.remove_doubles(threshold=.0001);bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.mesh.dissolve_limited(angle_limit=.002);bpy.ops.object.mode_set(mode='OBJECT')
 ob.data.materials.append(cream if d['m']==0 else glass)
 bevel=ob.modifiers.new('Bisel / reflejo de borde','BEVEL');bevel.width=.022 if d['m']==0 else .008;bevel.segments=3;bevel.affect='EDGES'
 if d['m']==0:
  bevel.limit_method='ANGLE';bevel.angle_limit=.4
  wn=ob.modifiers.new('Normales / caras limpias','WEIGHTED_NORMAL');wn.keep_sharp=True;wn.weight=50
  for f in mesh.polygons:f.use_smooth=True
 else:
  ob.name='Nucleo / vidrio ámbar facetado';ob.location.x=-.1;ob.location.z=.1
 ob.select_set(False)
# Núcleo con 20 facetas principales y bisel de aristas.
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1.42,location=(2.55,.95,1.5))
core=bpy.context.object;core.name='Nucleo / vidrio ámbar facetado';core.rotation_euler=(.12,.2,.18);core.scale=(1,.82,1.08);core.data.materials.append(glass)
bevel=core.modifiers.new('Bisel / reflejo de aristas','BEVEL');bevel.width=.003;bevel.segments=2
bpy.context.view_layer.update();low=min((core.matrix_world@v.co).z for v in core.data.vertices);core.location.z+=.025-low
# Ciclorama continuo: evita una línea de horizonte artificial detrás de la firma.
profile=[(-150,-.045),(3,-.045)]
for i in range(1,25):
 a=(math.pi/2)*i/24;profile.append((3+3*math.sin(a),-.045+3*(1-math.cos(a))))
profile.append((6,30))
verts=[(x,y,z) for x in [-150,150] for y,z in profile];n=len(profile)
mesh=bpy.data.meshes.new('Ciclorama');mesh.from_pydata(verts,[],[(i,i+1,n+i+1,n+i) for i in range(n-1)]);mesh.update()
ground=bpy.data.objects.new('Suelo / ciclorama nogal',mesh);S.collection.objects.link(ground);ground.data.materials.append(floor)
for f in mesh.polygons:f.use_smooth=True

def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,pos,target,power,color,size,shape='DISK',size_y=None):
 l=bpy.data.lights.new(name,'AREA');l.energy=power;l.color=color;l.shape=shape;l.size=size
 if name.startswith(('01','04')):
  # Atenuar sólo la imagen especular de los softboxes; conservar la iluminación difusa.
  l.use_nodes=True;nt=l.node_tree;em=nt.nodes.get('Emission');em.inputs['Color'].default_value=(*color,1)
  lp=nt.nodes.new('ShaderNodeLightPath');atten=nt.nodes.new('ShaderNodeMath');atten.operation='MULTIPLY';atten.inputs[1].default_value=.97
  both=nt.nodes.new('ShaderNodeMath');both.operation='MAXIMUM';nt.links.new(lp.outputs['Is Glossy Ray'],both.inputs[0]);nt.links.new(lp.outputs['Is Transmission Ray'],both.inputs[1]);nt.links.new(both.outputs[0],atten.inputs[0]);inv=nt.nodes.new('ShaderNodeMath');inv.operation='SUBTRACT';inv.inputs[0].default_value=1;nt.links.new(atten.outputs[0],inv.inputs[1])
  strength=nt.nodes.new('ShaderNodeMath');strength.operation='MULTIPLY';strength.inputs[1].default_value=1.0;nt.links.new(inv.outputs[0],strength.inputs[0]);nt.links.new(strength.outputs[0],em.inputs['Strength'])
 if shape=='RECTANGLE':l.size_y=size_y or size
 o=bpy.data.objects.new(name,l);S.collection.objects.link(o);o.location=pos;aim(o,target);return o
key=area('01 / principal crema',(-3,-4,6),(0,0,1),550,(1,.86,.69),4,'RECTANGLE',.2);key.visible_glossy=False
area('02 / contorno ámbar',(4,2.2,3.6),(1.5,.3,1),400,(1,.47,.12),.18,'RECTANGLE',3)
area('03 / tira de reflexión',(1,3,5),(1,0,1),180,(1,.73,.42),.15,'RECTANGLE',3)
fill=area('04 / relleno frontal',(-1,-5,2.4),(0,0,1),100,(1,.89,.76),3,'RECTANGLE',.2);fill.visible_glossy=False
# Área detrás del vidrio: no es emisión del objeto. Luz que atraviesa/revela sus facetas.
area('05 / transmisión ember',(3.8,2.5,1.7),(2.55,.95,1.4),90,(1,.4,.07),.15,'RECTANGLE',1.5)
bg=bpy.data.lights.new('06 / halo de fondo','SPOT');bg.energy=650;bg.color=(1,.42,.16);bg.spot_size=1.65;bg.spot_blend=1;bo=bpy.data.objects.new('06 / halo de fondo',bg);S.collection.objects.link(bo);bo.location=(1.6,2.5,3.8);aim(bo,(2.8,5.9,2.0))
bpy.ops.object.camera_add(location=(.4,-11,2.4));cam=bpy.context.object;cam.name='Camara / marca horizontal';aim(cam,(.4,0,1.45));cam.data.lens=49;cam.data.sensor_width=36;cam.data.dof.use_dof=False;S.camera=cam
S.render.filepath=str(HERE/'RUN_Marca_Horizontal.png')
S['Marca']='RUN / Compacta A';S['Version']='Entrega 2026.10';S['Nota']='RUN / Maestro de identidad. Camara, geometria, materiales y luces editables. Sin texturas externas.'
render_path=S.render.filepath
S.render.filepath='//'+Path(render_path).name
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'RUN_Maestro.blend'))
S.render.filepath=render_path
bpy.ops.render.render(write_still=True)
# Encuadres derivados del mismo maestro.
S.cycles.samples=32
S.render.resolution_x=1600;S.render.resolution_y=1600;cam.location=(.4,-13.8,2.6);aim(cam,(.4,0,1.6));S.render.filepath=str(HERE/'RUN_Marca_Cuadrada.png');bpy.ops.render.render(write_still=True)
S.render.resolution_x=1200;S.render.resolution_y=1200
for ob in S.objects:
 if ob.type=='MESH' and ob!=core:ob.hide_render=True
center=core.location.copy();cam.location=(center.x,-6.4,center.z+.4);aim(cam,center);cam.data.lens=55
S.render.filepath=str(HERE/'RUN_Nucleo.png');bpy.ops.render.render(write_still=True)
for ob in S.objects:
 if ob.type=='MESH':ob.hide_render=False
cam.location=(.4,-11,2.4);aim(cam,(.4,0,1.45));cam.data.lens=49
S.cycles.samples=48;S.render.resolution_x=2000;S.render.resolution_y=1250;S.render.filepath='//RUN_Marca_Horizontal.png'
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'RUN_Maestro.blend'))
# Exportación de geometría y material PBR para el núcleo web, sin suelo ni texto.
original_material=core.data.materials[0]
web,pbr=mat('RUN / vidrio ambar web','#FFF5E8',.018)
pbr.inputs['Transmission Weight'].default_value=.975;pbr.inputs['IOR'].default_value=1.46
core.data.materials[0]=web
bpy.ops.object.select_all(action='DESELECT');core.select_set(True);bpy.context.view_layer.objects.active=core
old_location=core.location.copy();core.location=(0,0,0)
bpy.ops.export_scene.gltf(filepath=str(HERE/'RUN_Nucleo_web.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
core.location=old_location;core.data.materials[0]=original_material
# El .blend conserva el material y la cámara originales, no el material de intercambio.
bpy.ops.wm.open_mainfile(filepath=str(HERE/'RUN_Maestro.blend'))
assert bpy.context.scene.camera.data.lens==49
report={'blender':bpy.app.version_string,'master_reopened':True,'master':'RUN_Maestro.blend','renderer':'Cycles','color_transform':'AgX / Medium High Contrast','external_textures':0,'core_web':'RUN_Nucleo_web.glb','web_material':{'baseColor':'#FFF5E8','transmission':0.975,'roughness':0.018,'ior':1.46,'metalness':0,'attenuationColor':'#F5B360','attenuationDistance':8.33,'thickness':0.55},'integration':'Aplicar con iluminación y entorno cálidos. El export web usa PBR; el maestro de imágenes conserva Glass + Translucent.'}
(HERE/'RUN_Parametros_3D.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('RUN / entrega 3D creada y maestro reabierto',flush=True)

# Completar volumen PBR del export web.
import struct
p=HERE
f=p/'RUN_Nucleo_web.glb'; b=f.read_bytes(); chunks=[]; off=12
while off<len(b):
 n,t=struct.unpack_from('<II',b,off);chunks.append((t,b[off+8:off+8+n]));off+=8+n
j=json.loads(chunks[0][1]); col=[int('F5B360'[i:i+2],16)/255 for i in (0,2,4)];col=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in col]
for m in j['materials']:
 m.setdefault('extensions',{})['KHR_materials_volume']={'thicknessFactor':.55,'attenuationColor':col,'attenuationDistance':8.33}
j.setdefault('extensionsUsed',[])
if 'KHR_materials_volume' not in j['extensionsUsed']:j['extensionsUsed'].append('KHR_materials_volume')
jb=json.dumps(j,separators=(',',':')).encode();jb+=b' '*((-len(jb))%4);chunks[0]=(chunks[0][0],jb);body=b''.join(struct.pack('<II',len(v),t)+v for t,v in chunks);f.write_bytes(struct.pack('<III',0x46546c67,2,len(body)+12)+body)
