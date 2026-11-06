# Auditoría de sólidos · fase 1

**Fecha:** 3 de noviembre de 2026. **Para:** Claude, dirección e implementación.

Hay obra sin sólido, piezas finas que permiten auparse y sólidos que no siguen el tamaño o el giro de la malla. La velocidad nueva no resuelve estos casos. El paso lateral del Pétalo mide **0,54 m entre sólidos**. Es el acceso más claro que exige revisar también la distribución visible.

## Alcance y criterio

Revisión de código, sin modificar ni ejecutar el juego. Las incidencias son deducciones de las funciones y sus medidas. No son fallos reproducidos en pantalla. No se ejecutaron `solidos.mjs`, pruebas de capítulos ni recorridos con `?solidos`.

Contexto leído: `COORDINACION.md`, `AGENTS.md`, `CLAUDE.md`, `PLAN_JUEGO.md` y las investigaciones de [movimiento](investigacion/01_movimiento.md), [combate](investigacion/02_combate.md) y [contenido](investigacion/03_contenido.md). El plan vigente prevalece sobre las propuestas anteriores. Código recorrido: los nueve módulos pedidos. Se consultaron además las consultas de terreno, movimiento, cristales, interacciones y apoyos del inicio para interpretar sus dependencias.

**Corrección de ubicación:** `Sol` está en `js/04-estructuras.js:8–114`. `js/00-nucleo.js` aporta `pieza`, `abollar` y las transformaciones de geometría. No define `Sol`. En la copia leída, `18-movimiento.js` ya declara **3,2 / 6,8 m/s** y subpasos de **0,12 m**.

Todas las medidas siguientes están en **metros**. Las coordenadas son locales a la pieza antes de `fin` o `ponerSolidos`, salvo las llamadas directas a `Sol` y los casos expresamente indicados. `hx` y `hz` son semimedidas. `y0` y `y1` son cotas, no centro y altura.

### Límites del sistema que afectan a toda la lista

| Consulta | Comportamiento comprobado | Consecuencia para integrar |
|---|---|---|
| `Sol.col(x,z,r,y0,y1)` / `Sol.add(x,z,hx,hz,ry,y0,y1)` | No reciben opciones. Devuelven el sólido. | En llamadas directas, usar `Sol.col(...).fina = true` o `Sol.add(...).fina = true`. Un argumento adicional `{ fina: true }` se perdería. |
| `sol` / `solC` de las utilidades | Sí reciben `{ fina: true }`. `fin`, `k.mover` y `ponerSolidos` conservan esa marca. | Marcar también cualquier sólido duplicado. Basta un duplicado sin marca para que `pared` vuelva a encontrar la pieza. |
| `Sol.pared` | Omite `fina`. Las demás paredes altas pueden iniciar trepa. Entre 0,45 y 1,75 m pueden iniciar aupado. | `fina` sirve como freno provisional de trepa y aupado en obra prohibida. Los permisos definitivos corresponden a la fase 4. |
| `Sol.suelo` | Las columnas solo dan suelo si `y1-y0 < 1.2`. Las cajas no tienen ese límite. No consulta `fina`. | **1,20 m exactos tampoco pasan el filtro de columnas.** No alargar una columna de apoyo hasta el terreno profundo. Separar cuerpo y losa superior de menos de 1,2 m. |
| `Sol.empujar` | Omite un sólido si su cima está a `y+0.65` o menos. Usa un intervalo corporal de 1,6 m. | `fina` no impide subir andando a una pieza baja ni aterrizar sobre ella. No equivale a «no pisable». |
| `Sol.dentro` | Comprueba un punto y un margen. `rMin` solo excluye columnas pequeñas. No consulta `fina`. | No es una prueba del cuerpo completo ni un barrido. Una caja ancha usada para un poste también afecta a la cámara. |
| Movimiento | `Sol.empujar` recibe radio **0,42 m**. | Un hueco de 0,65 m no admite el diámetro actual de **0,84 m**. Mantener al menos **0,90 m libres entre sólidos** en accesos de fase 1. No reducir el radio por esta auditoría. |

La franja solicitada, **0,3–1,9 m**, se mide desde el apoyo local de Hikari: suelo, galería, escalera o plataforma. Una baranda a 18 m del terreno también requiere sólido. Por eso una sonda que mire solo la altura sobre el terreno no basta para esta revisión.

## 1. Correcciones seguras de geometría y de marcas

«Segura» significa que conserva la función reconocible de la pieza y no exige decidir una ruta nueva. Claude debe verificar los accesos después de integrarla. Las dependencias con las decisiones de la sección 2 se indican expresamente.

### 1.1. Utilidades y piezas comunes · `24-arquitectura.js`

En esta sección, `F` abrevia **`{ fina: true }`**. Es notación del informe. No es una constante existente.

| ID · archivo y función | Qué ocurre | Cambio exacto propuesto |
|---|---|---|
| S01 · `04-estructuras.js`, `sol` y `fin`; `24-arquitectura.js`, `construir` | El `sol` de Estr no guarda giro propio. El de `construir` lo fija a 0. Una caja dibujada con `{ ry }` puede tener sólido con otra orientación. | Admitir `o.ry`: guardar `ry: o && o.ry || 0` en ambos `sol`. En `fin`, registrar con `ry + (s.ry || 0)`. `ponerSolidos` ya suma `s.ry + ry`; `k.mover` ya acumula el giro. Así las filas que usan `sol(...,{ ry, fina: true })` de este informe son integrables. |
| S02 · `torii`, 383–395 | Sus dos postes tienen sólido, pero permiten trepar. La basa alcanza radio `0.46*esc`; el sólido tiene `0.3*esc`. | Conservar los dos `solC(s*w/2,0,.3*esc,0,h)` añadiendo `F`. Añadir por basa `solC(s*w/2,0,.46*esc,-.04*esc,.10*esc,F)`. No unir los postes con una pared desde el suelo: cerraría el vano. Los travesaños altos se tratan en D02. |
| S03 · `toro`, 398–410 | Radio único `0.35*e`; plataforma y caja alcanzan `0.42*e`, basa y tejadillo `0.62*e`. Además permite trepar. | Sustituir el único sólido por `solC(0,0,.62*e,0,.32*e,F)`, `solC(0,0,.19*e,.32*e,1.37*e,F)`, `solC(0,0,.42*e,1.37*e,2.03*e,F)` y `solC(0,0,.62*e,2.03*e,2.50*e,F)`. Añadir `solC(0,0,.12*e,2.50*e,2.83*e,F)` para el remate. Son tramos por altura; no ensanchar todo el poste a 0,62. |
| S04 · `barandilla`, 450–457 | La barandilla cuadrada antigua solo dibuja. Se usa en el último piso del faro. | Por cada `s` añadir `sol(0,s*L/2,L/2+.04,.04,y,y+.70,F)` y `sol(s*L/2,0,.04,L/2+.04,y,y+.70,F)`. Mantener `barandal`, que ya tiene sólidos finos. |
| S05 · `barandal`, 253–265 | El sólido termina en los ejes de los postes. Los remates sobresalen 0,065 m y el pasamanos 0,04 m. La esfera ornamental también sobresale por arriba. | En lados horizontales usar `hx=abs(x1-x0)/2+.065`, `hz=.065`; en verticales, `hx=.065`, `hz=abs(z1-z0)/2+.065`. Mantener `y0=y`, `y1=y+alto+.10`, `F`. Por esfera extrema añadir `solC(x,z,.09,y+alto+.043,y+alto+.277,F)`, según su radio 0,09 y escala vertical 1,3. No elevar toda la baranda por la esfera ornamental. Revisar D01 antes de aplicar al Pétalo. |
| S06 · `escalinata`, 268–275 | Cada peldaño visible tiene profundidad `huella+.02`, pero el sólido solo `huella`. Las zancas inclinadas no tienen sólido en la pieza común. | Cambiar la semihuella a `(huella+.02)/2` en los dos casos de orientación. Conservar `y0` y `top`. Para las zancas, usar el método Z explicado debajo. No marcar los peldaños `fina`: son la ruta. |
| S07 · `casa`, 419–434 | La basa sobresale 0,35 m por lado, sin sólido propio. La galería visible es 0,30 m más ancha que su sólido. Falta el escalón delantero. | Añadir `sol(0,0,(w+.7)/2,(d+.7)/2,0,.55)`. Cambiar el de galería por `sol(0,d/2+.75,(w+.3)/2,.65,.53,.65)`. Añadir `sol(0,d/2+1.6,w*.2,.25,.18,.28)`. La pared y el tejado se separan en S08 y D02. |
| S08 · `casa`, sólido del cuerpo en 434 | El bloque `w/2+.1,d/2+.1` termina en `.55+h+.5`: no cubre los postes de radio 0,17 y añade 0,50 m de pared invisible sobre el cuerpo. También permite trepa. | Sustituir **ese bloque**, no los apoyos de S07, por `sol(0,0,w/2+.17,d/2+.17,.55,.55+h,F)`. El tejado necesita su solución propia D02; no considerar que esta caja lo sustituye. |
| S09 · `casa`, barril y leña en 432–433 | El barril permite auparse. La leña horizontal está fuera del cuerpo y carece de sólido en la pieza común. | Añadir `F` al `solC` del barril. Para los siete troncos, añadir `sol(-w/2-.34,-d/4,.11,.80,.63,1.17,F)`. Estas cotas incluyen el desplazamiento `h/2` que aplica `cy` antes de girar el cilindro. En Yoake quitar el bloque mayor duplicado de leña si se adopta este ajuste común. |
| S10 · `altar`, 318–324; llamadores de 04, 33 y 32 | La pieza no aporta sólidos. Los llamadores usan radios 1 o 1,1 que no cubren su basa `1.22*r`. | Centralizar en `altar`, con `k=alto/1.25`: `solC(0,0,1.22*r,0,.2*k,F)`, `solC(0,0,1.05*r,.2*k,.35*k,F)`, `solC(0,0,.70*r,.35*k,.85*k,F)` y `solC(0,0,.90*r,.85*k,1.25*k,F)`. Quitar los sólidos manuales antiguos de los cuatro pedestales del faro, altares de Pétalo/Duna/Marea y altar de memoria. En `cristalesMemoria`, conservar la obra completa y llamar a `ponerSolidos(obra,c.cx,c.cy,c.cz,0)`: ahora solo toma `.g`. |

**Método Z para las zancas de S06.** Conservar la geometría devuelta por cada `K.bx` de la zanca. Sus vértices ya contienen la inclinación y el giro. Dividir su longitud en tramos de **0,15 m como máximo**. Para cada tramo, recortar sus triángulos contra los dos planos de corte. Obtener `xmin,xmax,ymin,ymax,zmin,zmax` del fragmento resultante. Registrar `sol((xmin+xmax)/2,(zmin+zmax)/2,(xmax-xmin)/2,(zmax-zmin)/2,ymin,ymax,F)`. Así se cubre la piedra inclinada sin una pared rectangular sobre toda la escalera. No incluir la geometría de los peldaños en esta envolvente.

En Yoake, `escalonesCasa` y `torre.escalera` ya añaden sólidos laterales. Si se completa la pieza común con Z, **sustituir** esas aproximaciones, no sumar una segunda envolvente. En `torre.escalera`, su adaptador `sol` tendría que reenviar las opciones y conservar el volumen de las zancas; hoy transforma cualquier llamada en una losa de 0,18 m.

### 1.2. Faro, aldea, Mirador y muelle · `04-estructuras.js`

| ID · función y referencia | Qué ocurre | Cambio exacto propuesto |
|---|---|---|
| S11 · `construirFaro`, bancos en 283 | Los cinco bancos solo se dibujan. | Dentro del bucle añadir `sol(x,z,1.3,.35,.56,1.12,{ ry:r })`, después de S01. Es el volumen de asiento y apoyos; permite pisar el banco bajo. |
| S12 · `construirFaro`, basamento en 288 | Las cornisas visibles llegan a semilados 7,25 y 6. Los bloques sólidos solo llegan a 7 y 5,8. Las caras permiten aupado/trepa fuera de las escaleras. | Conservar los cuerpos, con `F`. Añadir `sol(0,0,7.25,7.25,2.53,2.75,F)` y `sol(0,0,6,6,3.95,4.15,F)`. No cambiar los diez peldaños de las cuatro escalinatas. La prohibición de ascender saltando por las cornisas exige D03. |
| S13 · `construirFaro`, pisos cerrados en 296 | Solo el primer piso recibe el bloque del cuerpo. Los cerramientos del segundo y tercero carecen de sólido propio. | Para **cada piso cerrado**, registrar `sol(0,0,n.w/2+.17,n.w/2+.17,yy,yy+n.h,F)`. Sustituir el bloque viejo del primer piso. Cotas locales: **4,1–8,7**, **9–13,2**, **13,5–17,4**. El último piso abierto conserva su interior. |
| S14 · `construirFaro`, último piso en 297 y 341 | La plataforma superior tiene apoyo: el `Sol.add` de 17,5–18,1. Sus cuatro postes no tienen sólido. | Añadir por `sx,sz`: `solC(sx*2.4,sz*2.4,.24,17.7,21.3,F)`. Mantener la losa de apoyo; no convertir este piso abierto en un bloque macizo. |
| S15 · `aldea`, pozo en 349 | El sólido de radio 1,6 no cubre toda la base de radio 1,7. Los postes sobre el pozo carecen de sólido por encima de 1,2 m. | Mantener la altura actual del cuerpo y ampliar su radio a **1,7**, con `F`. Añadir `solC(s*1.4,0,.10,1,3.2,F)` por poste y `sol(0,0,1.6,.15,3.1,3.25,F)` para la viga. No presentar el cuerpo de altura 1,2 como apoyo pisable. |
| S16 · `aldea`, tendederos en 351 | Los postes ya son finos y sólidos. La tela cuelga hasta 1,1 m, pero no tiene bloqueo. | Si se mantiene como tela atravesable, registrar la excepción D08. Los postes no necesitan otro sólido. No extender una pared entre ellos sin esa decisión. |
| S17 · `mural`, 226 | La basa tiene ancho 3,9; el sólido cubre 3,6. Además el mural permite trepa. | Sustituir el bloque único por `sol(0,0,1.95,.45,0,.5,F)` y `sol(0,0,1.70,.25,.5,3,F)`. Conserva el pie ancho sin ensanchar la losa entera. |
| S18 · `mirador`, muro caído en 385 | Cada sillar se dibuja con `ry:a`, pero su sólido no lleva ese giro local. | Mantener sus medidas y registrar `sol(sin(a)*9.3,cos(a)*9.3,.95,.35,-.2,h-.2,{ ry:a, fina:true })` tras S01. El giro mundial será `al+a`. |
| S19 · `muelle`, tableros en 414 | Las tablas van de −0,20 a **+0,05**, pero el apoyo termina en 0. | Cambiar cada apoyo a `sol(0,i*3,1.2,1.5,-.20,.05)`. Ajustar los puntos de pies de Kaito y las llegadas que usan `y0` a `y0+.05`; no desplazar solo el personaje de juego y dejar las escenas debajo. |
| S20 · `muelle`, pilotes en 414 | Los pilotes de radio 0,14 llegan a +0,20 sobre el origen del tablero. No tienen sólido bajo el muelle, accesible nadando. | Por cada pilote añadir `solC(s*1.1,i*3,.14,-4.8,.20,F)`. Conservar el tablero como apoyo separado. |

### 1.3. Piezas de lugar · `34-piezas.js`

| ID · función y referencia | Qué ocurre | Cambio exacto propuesto |
|---|---|---|
| S21 · `amarre`, 21–23 | El poste y su cuerda tienen sólido, pero permite auparse. La cuerda alcanza radio 0,265 a media altura. | Sustituir por `solC(0,0,.19*e,0,.98*e,F)` y `solC(0,0,.265*e,.405*e,.495*e,F)`. |
| S22 · `cobertizo`, 26–29 | Solo tiene sólido la pared trasera. Los cuatro postes y el banco se atraviesan. La pared permite trepa. | Añadir `solC(sx*1.7,sz*1.3,.12,0,2.4,F)` por poste y `sol(0,-.85,1.6,.4,.55,.65)` para el banco. Marcar el sólido de pared `F`. En `62.cobertizo`, retirar los cinco sólidos que ya añade para estas mismas piezas. El tejado queda en D02. |
| S23 · `carga`, 41–43 | La segunda caja termina en 1,05; el bloque termina en 1. | Cambiar `sol(.3,.1,.9,.6,0,1)` a `sol(.3,.1,.9,.6,0,1.05)`. Si dirección prohíbe también auparse a carga y barriles, aplicar D08. |
| S24 · `relojSol`, 110–115 | El disco tiene apoyo, pero el gnomon triangular de 1,5 m se atraviesa. | Conservar el disco. Añadir seis cajas finas, `i=0..5`: `sol(.025,-.15*i,.025,.9-.15*i,.4+.25*i,.65+.25*i,F)`. Cubren la lámina triangular por bandas de 0,25 m; no crear un cilindro alto que rellene todo el reloj. |
| S25 · `toldo`, 127–129 | Los cuatro postes no tienen sólido. | Añadir `solC(sx*w/2,sz*d/2,.07,0,h,F)` por poste. La tela superior se separa en D08. |
| S26 · `puertaArenisca`, 133–135 | El pilar tiene semilado 0,65; su basa 0,8. Permite trepar. El dintel solo es visual. | Añadir `F` a ambos pilares. Añadir por basa `sol(s*3,0,.8,.8,0,.4,F)`. Añadir `sol(0,0,4.1,.8,6,7,F)` y `sol(0,0,3.6,.7,7,7.4,F)` para dintel y remate. Mantener libre el vano de **4,4 m** entre basas. |

`valla` y `red` ya tienen paredes finas y conservan sus huecos. No se detecta ausencia de sólido en ellas. El campo de cultivo no necesita un bloque hasta la altura de las plantas.

### 1.4. Santuarios · `33-santuarios.js`

| ID · función y referencia | Qué ocurre | Cambio exacto propuesto |
|---|---|---|
| S27 · `santuarioPetalo`, 28–36 | La cornisa del basamento termina en 0,82 y llega a semimedidas 7,2 × 5,7. El bloque es 7 × 5,5 hasta 0,8. La galería visible termina en 0,94, sin apoyo propio. | Añadir `sol(0,0,7.2,5.7,.66,.82)` y `sol(0,-.3,6.3,4.8,.8,.94)`. Estas son las medidas actuales. Si se adopta D01, sustituir la segunda por las medidas ampliadas allí. |
| S28 · `santuarioPetalo`, atril en 48 | Su caja tiene volumen suficiente, pero permite auparse desde la galería. | Conservar `sol(lx,lz,.5,.35,.8,1.8)` y añadir `F`. No mover el atril sin comprobar D01. |
| S29 · `santuarioEscarcha`, pórtico en 84–86 | Los fustes alcanzan radio 1,1 y las basas 1,6; los sólidos solo radio 1. Permiten trepar. | Por cada `s`: `solC(s*5.5,0,1.1,0,8,F)` y `solC(s*5.5,0,1.6,0,.5,F)`, sustituyendo los dos cilindros de radio 1 y altura 9. Añadir `sol(0,0,6.7,.55,6.4,7.15,F)` para el travesaño recto. El arco curvo superior requiere D02. |
| S30 · `santuarioDuna`, seis columnas en 93 | Las seis columnas laterales de 5,5 m no tienen sólido. | Dentro del bucle añadir `solC(sx*8.5,-3+k*3.2,.7,0,5.5,F)`. |
| S31 · `santuarioDuna`, cuatro columnas y coronación en 94–98 | Las columnas en `x=±2.6,z=±1.9` quedan fuera de la caja del salón. La coronación de tres losas tampoco tiene sólido. | Añadir por columna `solC(sx*2.6,sz*1.9,.36,6,9.2,F)`. Añadir `sol(0,0,3.1,2.3,9.2,9.6,F)`, `sol(0,0,2.7,1.9,9.6,9.95,F)` y `sol(0,0,2.2,1.4,9.95,10.25,F)`. Marcar `F` el cuerpo `sol(0,-.2,2.1,1.5,6,9.2)`. Las gradas quedan en D03. |
| S32 · `santuarioDuna`, pirámides en 114–122 | Las cornisas tienen 0,30 m más de ancho que los bloques. Los pedestales del glifo en la cima no tienen sólido. | Por grada añadir `sol(0,0,w/2+.15,w/2+.15,yy+h-Q.cornisa,yy+h,F)`. Por pedestal añadir `solC(0,0,.5,0,Q.pedestal)` y `solC(0,0,.55,Q.pedestal,Q.pedestal+.1)` antes de su `fin(P.x+.8,...)`. Mantener su apoyo bajo separado. Los bloques altos deben recibir la regla D03. |
| S33 · `santuarioMarea`, pilotes en 141 | Los cuatro pilotes no tienen sólido. Sobresalen hasta 1 m local: 0,5 m sobre la tarima. | Añadir `solC(sx*5.5,sz*5.5,.3,-8,1,F)` por pilote. A esa altura el controlador actual puede pisar la punta; la marca solo elimina trepa/aupado. |
| S34 · `santuarioMarea`, pasarela en 152–153 | Los postes de baranda y los pilotes de apoyo solo se dibujan. | Por poste de baranda añadir `sol(s*1.15,0,.07,.07,0,1,F)`. En cada tramo con pilotes añadir `solC(s,0,.12,-5.7,.3,F)`. No crear una pared continua entre los postes: no hay larguero visible. |

La losa de Escarcha **sí tiene apoyo válido**: radio 12,2 y grosor 0,78. La losa de la cima de Kiri también: `.3–.48`. No sustituir ninguna por el cilindro profundo de debajo.

### 1.5. Cuevas · `32-cuevas.js`

| ID · función y referencia | Qué ocurre | Cambio exacto propuesto |
|---|---|---|
| S35 · `construirCueva`, estalagmitas en 76–78 | Las de altura entre 0,64 y 0,70 no reciben sólido. Las mayores usan `rs*.8`, menor que la base visible `rs`. | Quitar el filtro `hs>D.solidoAlto`. Registrar todas con `Sol.col(q.x,q.z,rs,q.y,q.y+hs).fina=true`. Si el cilindro completo invade un acceso real, dividir el cono por alturas en vez de reducir su radio; ver D06. |
| S36 · `construirCueva`, cristales en 88–94 | Las instancias con escala 0,9–1,2 no tienen sólido, aunque sus agujas llegan a la franja del cuerpo. Las demás usan un radio/alto independientes de la inclinación real. | Quitar el filtro `esc>D.solidoEsc`. Para cada instancia, transformar los vértices de `gc` por su `mm`; obtener `rMax=max(hypot(v.x-q.x,v.z-q.z))`, `yMin=min(v.y)`, `yMax=max(v.y)`. Usar `Sol.col(q.x,q.z,rMax,yMin,yMax).fina=true`. Esta fórmula da parámetros concretos para la semilla y rotación existentes. Si dos envolventes cierran el paso, aplicar D06 antes de integrarlas. |
| S37 · `cristalesMemoria`, 112 | Los cuatro cristales del reto tienen sólido suficiente, pero sin marca fina. | Conservar `Sol.col(x,z,.8,c.cy,c.cy+3)` y asignar `.fina=true`. Dentro de la cueva la entrada de trepa ya está deshabilitada; la marca evita depender de esa excepción. |

El altar de memoria recibe S10. Las paredes y el pórtico natural se separan en D06. No llenar la cámara o el túnel con un `Sol.col` macizo.

### 1.6. Arenas · `31-arenas.js`

| ID · función y referencia | Qué ocurre | Cambio exacto propuesto |
|---|---|---|
| S38 · `vestir`, torii de Escarcha/Marea y puerta de Arena, 42–43, 56, 78 | Hay sólidos manuales además de los que ya registra `ponerSolidos(obra)`. Los manuales no son finos y anulan la corrección común. | Quitar los bucles manuales de los **dos torii y de la puerta de arenisca**. Conservar los sólidos de `torii`/`puertaArenisca` corregidos en S02/S26. Sus cotas mundiales deben incluir el desplazamiento de la obra, −0,05 y −0,10 respectivamente. |
| S39 · `vestir`, faroles de plataformas de Marea, 76 | También se duplica el farol: `Arquitectura.toro` registra el suyo y `vestir` añade otro cilindro sin `fina`. | Quitar el `Sol.col(f.x,f.z,.3,...)` manual. S03 será la única fuente del farol, trasladado por `k.mover`. Mantener `B.plataformas.push(p)`. |
| S40 · `vestir`, plataformas de Marea, 75; malla en 154 | La losa superior mide `P.lado+.16`, pero el bloque sólido solo `P.lado`. | Conservar cuerpos y peldaño. Añadir `Sol.add(p.x,p.z,(P.lado+.16)/2,(P.lado+.16)/2,a,y+P.alto-.16,y+P.alto)`. Semilado resultante: **1,88**. El ascenso es intencional; ver tabla de fase 4. |
| S41 · `vestir`, altar del Musgoso, 37; malla en 98 | El bloque visible mide 2,6 × 1,6 y su tapa 2,9 × 1,9. El sólido mide 2,4 × 2,4, no gira y termina 0,18 m antes de la tapa. | Sustituir por `Sol.add(al.x,al.z,1.3,.8,ang0,y,y+1).fina=true` y `Sol.add(al.x,al.z,1.45,.95,ang0,y+1,y+1.18).fina=true`. |
| S42 · `vestir`, columnas de glifos de Arena, 67; malla en 122–125 | Radio 1,1 frente a basa/capitel de 1,3. La pequeña roca lateral tampoco tiene sólido. | Sustituir la columna por tres: `Sol.col(p.x,p.z,1.3,y,y+.3).fina=true`, `Sol.col(p.x,p.z,1.12,y+.3,y+2.3).fina=true`, `Sol.col(p.x,p.z,1.3,y+2.3,y+2.6).fina=true`. La roca lateral se ajusta por D05, sin englobarla en el cilindro de la columna. |
| S43 · `vestir`, ruinas de Arena con `t===0`, 60; malla en 131 | El tambor vertical tiene basa de radio 0,95 y sólido de 0,8. | Mantener el fuste de radio 0,8; añadir `Sol.col(p.x,p.z,.95,y-.2,y+.05).fina=true`. Marcar también el fuste fino si se aplica la prohibición de trepar ruinas construidas. |
| S44 · `crearBaliza`, 178–179 | La basa de radio 1,1 solo tiene sólido de 0,6. El remate llega a 3,9 y el sólido a 3,2. | Sustituir por `Sol.col(x,z,1.1,y,y+.5).fina=true` y `Sol.col(x,z,.6,y+.5,y+3.9).fina=true`. No usar una única columna de radio 1,1 hasta arriba. |
| S45 · `crearLinterna`, 168–169; `24.linterna` | El cilindro de radio 0,4 deja fuera las esquinas de la caja cuadrada. `linterna()` no aporta sólido propio. | Sustituir el cilindro por `Sol.add(x,z,.36,.36,0,y,y+.26).fina=true`, `Sol.col(x,z,.11,y+.26,y+1.62).fina=true` y `Sol.add(x,z,.35,.35,0,y+1.62,y+2.34).fina=true`. El tejadillo entra en D02. Si se centraliza en `linterna`, conservar el objeto completo y llamar a `ponerSolidos`; ahora solo se usa `.g`. |

La fogata de Escarcha **ya tiene `fina=true`**. Su base baja no necesita convertirse en un muro. Las ampliaciones de hielo, pilares y rocas se agrupan en D05.

### 1.7. Objetos de capítulo y Yoake · `61-escenario-capitulos.js` / `62-isla-yoake.js`

| ID · archivo, función y referencia | Qué ocurre | Cambio exacto propuesto |
|---|---|---|
| S46 · `61`, `emisor`, 62 | El bloque existe, pero permite trepar. | Conservar sus parámetros y asignar `.fina=true`. El barrido del postigo se trata en D07. |
| S47 · `61`, `atril`, 103–105 | El tablero mide 0,9 × 0,6, con inclinación de 0,18 rad. El sólido solo mide 0,6 × 0,5. | Sustituir por `Sol.add(x,z,.45,.31,0,y,y+1.12).fina=true`. La semiprofundidad real del tablero es `(.6*cos(.18)+.08*sin(.18))/2=0.3023`; 0,31 la cubre. La cota 1,12 cubre tablero y hoja inclinados. |
| S48 · `61`, `estela`, 123 | El bloque cubre la losa, pero permite trepar la placa de 2,6 m. | Conservar `Sol.add(x,z,.85,.2,0,y,y+2.6)` y asignar `.fina=true`. |
| S49 · `61`, `crear5`, cierre en 170 | El cierre del extractor y su palanca no tienen sólido. | Añadir `Sol.add(P.x,P.z,.125,.125,0,P.y,P.y+1.1).fina=true` y `Sol.add(P.x,P.z,.04,.04,0,P.y+1.05,P.y+1.55).fina=true`. Conservar la losa de 3,6 × 3,6 como apoyo. El aro se trata en D07. |
| S50 · `62`, `casaAbierta`, paredes en 161,164,168 y chimenea en 189 | Todas esas cajas permiten trepar hacia la cubierta. | Añadir `F` a los sólidos de las cuatro paredes y la chimenea. Mantener la puerta de 2,2 m. Con sus postes de radio 0,13 quedan **1,94 m** libres. No sustituir estas casas por el bloque macizo de `Arquitectura.casa`. |
| S51 · `62`, `cisterna`, pared en 313 | Sus paredes de 1,5 m permiten auparse. No son una ruta aprobada. | Conservar medidas y añadir `F` a cada pared. El hueco de salida de 0,8 m ya está cerrado por un sólido fino en 326: es una salida de agua, no una entrada de Hikari. |
| S52 · `62`, `torre`, caja de la lámpara en 387 | El bloque es correcto como envolvente de la caja, pero permite auparse desde el rellano. | Añadir `F` al `k.sol(0,0,T.cajaAncho/2,T.cajaAncho/2,T.alto,T.alto+T.lamparaY+T.cajaAlto)`. Conservar postes y mástil finos, escaleras y losas pisables. |

En Yoake, `poner` **sí registra** los sólidos y `poste` **ya usa** `fina`. `losa` conserva un apoyo de 0,18 m. No se detecta pérdida general de sólidos por traslación. La barca de travesía no tiene colisión mundial por una decisión explícita del módulo: se mueven juntos grupo y pasajeros durante la escena. No añadirle un sólido fijo en su punto de construcción.

## 2. Casos que requieren decisión o ajuste conjunto

Aquí falta elegir una forma de contacto, preservar un acceso o completar el controlador. No se propone aprobar automáticamente estas opciones. Las preguntas de diseño se remiten a Claude; cualquier contenido no decidido queda como **Pregunta para el usuario**.

### D01 · Pétalo: galería demasiado estrecha

**Archivo y función:** `33-santuarios.js`, `santuarioPetalo`, 28–48; `24-arquitectura.js`, `muro` y `barandal`.

La pared sólida llega a `x=±5.6`; la cara interior del barandal está en `±(6.2-.06)`. Quedan **0,54 m**. Delante y detrás ocurre lo mismo: `4.7-.06-4.1=0.54`. La geometría de los postes del salón llega todavía 0,07 m más lejos. No es un acceso de 0,65 m ni de 0,84 m.

**Propuesta concreta para revisión:** conservar el salón de 11 × 8. Ampliar la galería a **13,8 × 10,8**, centrada en `(0,-.3)`, y la baranda a **13,6 × 10,6**. Suelo: `sol(0,-.3,6.9,5.4,.8,.94)`. Cuerpo: `sol(0,-.3,5.67,4.17,.8,5,F)`. Tras S05, la holgura lateral queda en **1,065 m** y la frontal/trasera en **1,065 m**. Mantener el basamento con su cornisa de 14,4 × 11,4.

La caja de ofrendas ocupa `x=±.75,z=4.6..5.3` en el acceso. Con el hueco actual de baranda de 3,2 m, cada salida lateral deja menos de 0,84 m al incluir el poste. Ampliar el hueco frontal de baranda a **4,2 m**; quedan **1,285 m por lado** entre saisen y extremo de baranda. Conservar la escalera de ancho 4. El atril en `(2.7,5.05)` debe conservar su acceso exterior; comprobar lectura e interacción tras ampliar.

**Pregunta para el usuario:** confirmar con dirección esta ampliación visible o elegir mover la caja de ofrendas fuera del eje. Reducir los sólidos para simular un paso atravesando la madera no resuelve el problema.

### D02 · Tejados, ménsulas y travesaños altos sin volumen de contacto

**Funciones afectadas:** `24.tejado`, `muro`, `mensulas`, `sorin`, `torii`, `linterna`; sus colocaciones en `04.construirFaro`, `33.santuarioPetalo/Marea/Escarcha` y las casas, cobertizos, cisterna y señal de `62`.

`techo` y `tejado` solo generan geometría. `muro` tampoco registra sólidos propios: depende del llamador. Las ménsulas sobresalen del cuerpo. Aunque muchas están a más de 1,9 m del terreno, entran en la franja corporal desde escaleras, pisos y espiral, o durante salto y planeo. Añadir `fina` al cuerpo evita el agarre, pero no da volumen al alero.

**Propuesta exacta de parametrización:** obtener la malla final de cada tejado. Dividir su planta en celdas de **0,25 × 0,25 m**. Recortar los triángulos contra cada celda; por cada intervalo vertical ocupado registrar `sol(cx,cz,hx,hz,ymin,ymax,F)`, con `hx,hz≤.125`, sin rellenar desde el suelo hasta `ymin`. Las ménsulas se pueden registrar por cada caja `B`: mismos `bw/2`, `bt/2`, giro de `L.ry` y cotas `yy..yy+bh`. En Estr requieren S01. Aplicar el mismo criterio de fragmentos a la viga curva de `torii`, al arco de Escarcha y al `sorin`; no poner una pared sobre el vano entero.

**Decisión técnica de Claude:** elegir esta aproximación, una colisión específica de cubierta o la solución de barrido posterior. Una caja con la huella completa del tejado y altura hasta su cumbre llenaría aire y cerraría pasos. Miles de cajas sin índice espacial también pueden resultar costosas. No se afirma que la cuadrícula propuesta cumpla 60 FPS sin medirla.

Hay además una limitación del controlador: no resuelve el golpe vertical contra un techo de obra. Solo hace una corrección explícita contra el techo de cuevas. **Ningún ajuste de `sol` garantiza por sí solo que un salto desde debajo del alero deje de atravesarlo.** Registrar este caso para Claude junto a la validación de subpasos y la fase 10 si sigue siendo necesario.

### D03 · Casas, templos, muros y pirámides: bloquear la ruta lateral

**Ubicaciones concretas:** cuerpos de `24.casa`; pisos y basamentos de `04.construirFaro`; salón de `33.santuarioPetalo` en 36; cuatro gradas de `santuarioDuna` en 92; cinco gradas de cada pirámide en 115; pabellón de Marea en 145; paredes y chimenea de `62.casaAbierta`; muros de ruinas de `04.mirador` y `31.vestir`.

**Cambio provisional concreto:** añadir `F` a los bloques citados y a sus cornisas. No aplicarlo a los peldaños. Así `Sol.pared` deja de autorizar trepa y aupado en ellos. Para el salón del Pétalo usar las medidas de D01. En Marea, los postes sobresalen hasta 4,37: si se mantiene cerrado, sustituir su bloque por `sol(0,0,4.37,4.37,.5,3.7,F)` y añadir `sol(0,0,4.5,4.5,3.7,3.95,F)` para el tablero bajo cubierta. El tejado sigue pendiente en D02.

**Pendiente de fase 4:** separar `pisar`, `aupar` y `trepar`. El salto simple tiene una altura balística aproximada de **2,04 m** (`9.9²/(2*24)`). Las gradas de pirámide suben **1,3 m** y las del templo **1,5 m**. Hikari puede saltar por sus caras aunque todas sean `fina`. Si «salvo su ruta» exige impedir también esa subida, hay que restringir el ascenso por esas caras o cambiar su diseño. No inflar el sólido hacia fuera hasta tapar la escalera ni inventar un permiso ya implementado.

**Pregunta para el usuario:** confirmar con dirección si la prohibición incluye aterrizar desde planeo y subir por saltos, además de la trepa y el aupado. La regla de trepa ya está aprobada; esta pregunta concreta afecta a cómo se resuelven las cornisas.

### D04 · Marea: altar dentro de un pabellón macizo

**Archivo y función:** `33-santuarios.js`, `santuarioMarea`, 142–168.

El altar está en el centro, dentro de `sol(0,0,4.3,4.3,.5,4)`. Las «puertas» de `muro` son papel y celosía sobre una caja de enlucido completa; no son huecos transitables. El alcance de ofrenda de `07-sistemas.js` es 6 m en planta y permite acercarse desde el perímetro, pero eso no demuestra que toda interacción de capítulo resulte legible y accesible al bloquear trepa.

**Opción exterior, con medidas para revisión:** conservar el pabellón cerrado y ampliar la tarima de 12 × 12 a **17,4 × 12**. Sustituir su apoyo por `sol(0,0,8.7,6,-.5,.5)`. Poner el altar en **(6.49,0)**, con los sólidos de S10 trasladados allí, y actualizar `E.altar.marea`. Su basa de radio 1,22 queda a **0,90 m** del cuerpo corregido de semilado 4,37 y a **0,99 m** del borde exterior. Ampliar la baranda frontal a ancho **17,1**, conservar fondo **11,7**, y llevar su lado izquierdo a `x=-8.55`; los lados derecho y posterior siguen abiertos como hoy. Cambiar también la malla de tarima y la disposición de sus apoyos. Es una ampliación visible considerable, sujeta a decisión.

**Opción de interior abierto, parámetros concretos:** reemplazar la caja maciza visible de `muro` por paredes de espesor **0,18 m**, en `x=±4.2` y `z=±4.2`, de `.5` a `3.7`. Sólidos laterales `sol(±4.2,0,.09,4.2,.5,3.7,F)` y posteriores/frontal `sol(0,±4.2,4.2,.09,.5,3.7,F)`. En los lados 1 y 2, sustituir cada pared por dos tramos que dejen una puerta de **2,2 m**: longitud de cada tramo **3,1**, semilargo **1,55**, centro a **±2,65** del eje de ese lado. Añadir dintel sobre el hueco, no una caja hasta el suelo. Adaptar también la geometría y sus postes a ese vano.

**Pregunta para el usuario:** decidir con dirección entre exterior accesible e interior realmente abierto. No quitar solo el sólido conservando la caja visible atravesable.

### D05 · Roca irregular y cilindros que no llegan a su superficie

En estas piezas, sustituir un radio por otro mayor puede cerrar un paso o crear suelo flotante. Se necesita ajustar la envolvente por forma y comprobar el lugar. La siguiente tabla identifica las piezas y da la parametrización propuesta, sin fingir medidas tomadas en pantalla.

**Procedimiento E:** conservar la geometría final de la pieza, ya escalada y girada, antes de fusionarla. Recortarla por bandas horizontales de **0,20 m**. En cada banda calcular el radio máximo respecto a su centro `(x,z)` y registrar `solC(x,z,rMax,ymin,ymax,opciones)`. Para piezas alargadas usar su caja orientada de semimedidas calculadas, no el círculo circunscrito. Las cotas se obtienen de triángulos recortados, incluidas las intersecciones con los planos de banda; no solo de vértices que casualmente caigan dentro. Este es el cambio exacto propuesto cuando la tabla dice E.

**Dependencia:** una división en columnas bajas cambia qué encuentra `Sol.suelo`. Antes de integrar E en decoraciones no pisables, deben existir sus permisos de fase 4 o una consulta que conserve la condición de cuerpo alto original. Las bandas de contacto no deben convertirse en una escalera automática. Por esta razón E queda en la sección de decisión técnica, no entre las correcciones seguras de fase 1.

| Archivo y función | Incidencia concreta | Propuesta / decisión necesaria |
|---|---|---|
| `04`, `arco`, 240–242 | Sus extremos deformados usan radio fijo `3.3*esc`, pero se escalan hasta `1.2*esc` en profundidad. La parte curva superior no tiene sólido. | E en cada pie y en el arco por fragmentos, conservando el hueco. Si se autoriza pisar la cumbre, añadir una losa de grosor **0,18** en su superficie superior; no usar el cilindro de altura `12*esc` como suelo. Decidir si estos arcos forman una ruta autorizada. |
| `04`, `hoodoos`, 250–253 | La base nominal ya es `1.25*w`, mayor que el radio `1.15*w`; además se deforma. El remate también cambia de anchura. | Sustituir el cilindro por E sobre el `g` transformado. Permisos de roca natural, sujetos a zonas de fase 4. |
| `04`, `columnasBasalto`, 263 | Radio visual 1,05, sólido 1. Los cilindros altos no dan apoyo en la cima. | Radio **1,05** en el cuerpo. Si se conservan como recorrido trepable, añadir `solC(px,pz,1.05,yy+h-.18,yy+h)` por cima. Decidir qué columnas pertenecen a una ruta; no habilitar todo el macizo por defecto. |
| `04`, `circuloPiedras`, 271–273 | Las piedras están inclinadas/deformadas; radio fijo 0,9 no sigue esa forma. El altar central de radio 1,8 y alto 0,5 no tiene sólido. | E para monolitos, con prohibición de trepa si siguen siendo obra ritual. Añadir al disco `solC(0,0,1.8,0,.5)` como apoyo bajo. |
| `04`, `mirador`, 379–380 | Basas de radio 0,7 frente a sólido 0,65; los capiteles pueden sobresalir y quedar por encima de `y1`. | Separar basa `solC(x,z,.7,t,t+.3,F)`, fuste `solC(x,z,.56,t+.3,t+.3+h,F)` y, si existe, capitel `solC(x,z,.66,t+.3+h,t+.6+h,F)`. Decidir si las columnas rotas deben seguir siendo apoyos opcionales; sus cilindros altos actuales no lo son. |
| `04`, `mirador`, roca central en 383 | La roca que acompaña la katana no tiene sólido. El bloque de debajo solo llega a `t+.55`. | E sobre esa roca, con apoyo superior de **0,18** si se quiere pisar. Conservar el acceso a la katana. No meter un cilindro alto y dar por hecho que será suelo. |
| `04`, `mirador`, bloques sueltos en 386 | Tres bloques rotados e inclinados no tienen sólido. | Para cada caja original, conservar su geometría final y registrar la envolvente con sus cotas reales; en planta, semiejes antes de inclinar **`.55*s` y `.4*s`**, giro **`x`**. La inclinación de 0,25 aumenta la semimedida x a `(.55*cos(.25)+.35*sin(.25))*s` y la altura total a `(1.1*sin(.25)+.7*cos(.25))*s`. Cota central `.25*s`. No usar el tamaño sin inclinar. |
| `04`, `mirador`, columnas tumbadas en 388–389 | Los cilindros de radio 1 y 0,8 no cubren las piezas alargadas, de longitudes 3,2 y 1,6. | Cambiar a cajas orientadas calculadas sobre las dos geometrías transformadas. Primera: eje longitudinal girado por `ry=.4`; segunda `ry=1.2,rx=PI/2-.2`. Usar `ymin/ymax` reales, no los actuales 0–1, que también pueden dar apoyo sobre aire. |
| `33`, `santuarioEscarcha`, nueve espigas en 79–80 | El radio fijo 0,9 no sigue el cono deformado. Todas permiten trepa. | E con `F`. No hacerlas pisables por añadir una tapa a su punta. |
| `33`, `santuarioDuna`, obeliscos en 99 | Radio 1 frente a base cuadrada inscrita de radio 1,1. Permiten trepa. | Reemplazar por E con `F`, incluido el remate sólido si se conserva. No llenar todo el contorno circular de la arena. |
| `33`, `santuarioMarea`, rocas de faroles en 160 | Solo choca el farol: la roca deformada de semiescalas 1,4 × 1,2 carece de sólido. | E para la roca; mantener los tramos del farol de S03 separados. Si se pisa, apoyo bajo de **0,18** en su superficie. |
| `33`, `cimaKiri`, corona y mojón en 176–181 | La corona llega nominalmente a `C.losa+.3=2.9`; el cuerpo solo a `C.losa*.8=2.08`. Las tres piedras del mojón no tienen sólido. | E para la corona bajo la losa; conservar `solC(0,0,2.6,.3,.48)` como apoyo. E para cada piedra del mojón, en su punto mundial `(q.x,q.z)` y cotas desde `h+.48`. Marcar el mojón `F`; la roca natural inferior sí pertenece al acceso aprobado. |
| `24`, `zorro`; `34`, `hokora` | La basa rectangular del zorro, 1,5 × 1,2, no cabe en círculo de radio 0,8 en las esquinas. La de `hokora`, 1,4 × 1,2, tampoco cabe en radio 0,75. Ambos permiten auparse o trepar. | En `24.zorro`, añadir `sol(0,0,.75,.6,0,.5,F)` y marcar su columna `F`. En `34.hokora`, añadir `sol(0,0,.7,.6,0,.4,F)`, marcar la columna `F` y cubrir el tejadillo mediante D02. No agrandar toda la columna hasta el radio de la esquina de la basa. |
| `34`, `cabezaPiedra`, 119–124 | La cabeza se escala a 1,3 en profundidad y la nariz sobresale aún más. El sólido solo tiene radio `1.25*e` y termina en `2*e`. | E para cabeza, cejas, nariz y boca, con `F`, conservando la posición enterrada del llamador. No aplicar a la malla visible el desplazamiento −1 que solo tiene el sólido actual. |
| `34`, `arbolSeco`, 103–104 | El tronco inclinado puede salir de la columna vertical. En Cerezo hay además un cilindro manual de radio 0,55. | E para los segmentos de tronco/ramas que entren en la franja corporal. Quitar el cilindro manual de `31.vestir` en 88 si se centraliza aquí. Decidir si es obstáculo natural trepable; no autorizarlo por ser alto. |
| `31`, `obraArena`, anillos en 95 | Las 20 posiciones de rocas de cada arena no registran sólidos. El hueco de entrada se reserva visualmente, pero el resto se atraviesa. | E por roca, conservando las posiciones omitidas por `cos(a-ang0)>.94`. Comprobar si el anillo debe ser obstáculo bajo que se salta o límite del encuentro. No unir sus huecos con una pared invisible. |
| `31`, `vestir` Musgoso, 36; malla en 97 | Radio 1,3 frente a basa 1,5; el remate rocoso queda parcialmente fuera del alto 5,5. | Añadir basa `Sol.col(p.x,p.z,1.5,y,y+.3)`. E para el remate y fuste; mantener actualizado el radio de `B.pilares`, usado por el combate. Decidir si se pisa arriba; si sí, añadir apoyo bajo. |
| `31`, `vestir` Escarcha, 44; malla en 113–114 | Todas las espigas usan alto 4, pero las visibles miden **3 / 4,4 / 5,8** y arrancan en `y-.2`. | E por espiga, con `F`, sustituyendo el cilindro uniforme. La punta de la más alta llega nominalmente a `y+5.6`, antes de la deformación. |
| `31`, `vestir` Escarcha, mojones en 47 y leña en 52 | Los cilindros de los mojones son altos para piezas bajas; el de la leña no sigue los troncos horizontales. | E para las tres piedras de cada mojón y cajas orientadas para la leña, con `ymin/ymax` de sus geometrías. Mantener fogatas `F` y leña baja pisable si se conserva esa intención documentada. |
| `31`, `vestir` Arena, ruinas `t===1/2`, 61–62 | La caja del muro cubre el paño, pero no siempre la roca lateral. La del tambor caído ya es alargada; no debe sustituirse por una columna. | Conservar `Sol.add(...,2.1,.4,a,...)` del paño y `Sol.add(...,1.7,.66,a,...)` del tambor. E para la roca lateral. Si el paño no se trepa, marcar su caja `fina`. |
| `31`, `vestir` Marea, rocas de musgo en 80; malla en 141 | Radio fijo 0,55 frente a una roca de ancho nominal 1,2 y deformación. Su altura y contorno de apoyo tampoco coinciden necesariamente con `y+.55`. | E con permiso de pisar, como indica la intención actual. Para bordillos y pasos bajos de 140 y 158, añadir apoyo con la misma caja o columna de su malla: semimedidas `(TAU*rb/M.bordillo-.08)/2,.35`, giro `a`, cotas `y-.1..y+.22`; en cada piedra del camino, radio `.7`, cotas `y-.04..y+.10`. Estos elementos bajos no son paredes corporales. |

**Pregunta para el usuario:** decidir con dirección cuáles de las formaciones naturales adicionales son rutas de escalada. Las rocas de aldea, acantilados y rutas de Kiri/Duna sí están aprobadas en el plan; esa autorización no identifica automáticamente todos los hoodoos, arcos, árboles secos o anillos de combate.

Las plataformas cónicas bajas del faro y la terraza octogonal del Mirador ya tienen apoyo, pero sus cilindros son aproximaciones: el primero usa radio 22,4 frente a un borde superior de 22, y la terraza de ocho lados se envuelve con un círculo. No aumentar indiscriminadamente sus radios: aparecería más suelo sobre aire. Si se exige coincidencia de 0,02–0,05 m también en esos bordes, usar contorno poligonal o bandas de la superficie real. Es una decisión técnica aparte de corregir obra totalmente atravesable.

### D06 · Cuevas: contorno y densidad de decoración

**Archivo y funciones:** `32.construirCueva`, `portico`; consultas `proyCueva/enCueva` en `02-terreno.js`.

La envolvente del túnel y la cámara no se registra en `Sol`. Hay suelo y techo especiales de cueva; eso no equivale a una pared de obra coincidente con cada triángulo deformado. Las jambas del pórtico usan radio `1.3*.95=1.235`; la geometría se escala hasta `1.3*1.2=1.56` antes de deformarse. El arco y el saliente superior no tienen sólidos propios.

**Propuesta concreta:** E para cada jamba, conservando el hueco central; fragmentos de D02 para arco y saliente. Para el túnel, registrar sus paños laterales por cada pareja consecutiva de anillos: `Sol.add(cx,cz,semilargo,semiespesor,ry,ymin,ymax)` calculado sobre el paño, con espesor de contacto **0,10 m hacia la roca**. No añadir cajas que crucen el eje. Para la cámara, excluir los triángulos de la boca que el constructor ya elimina. Claude debe elegir si conserva esta aproximación o un límite específico de cueva.

Tras S35/S36, comprobar accesos a ambos cofres y el corredor emisor–Sayo. La generación evita sectores por ángulo, pero **no comprueba separaciones entre sólidos**. En el túnel más estrecho, el centro de la decoración puede estar a `0.55*4=2.2` m del eje; una envolvente cristalina grande puede invadir ese margen. En la cámara de Luciérnagas, `libreCentro=9.5` es mayor que `Rc*borde=9.2`: el intervalo del generador está invertido. No se ha demostrado que cause un bloqueo concreto, pero merece corregirse al redistribuir.

**Regla propuesta para colocar, no para encoger sólidos:** reservar un corredor central de **1,20 m de ancho** en el túnel. Rechazar o recolocar una pieza si su envolvente entra en ese corredor. Reservar también un corredor de **1,20 m** hacia cada cofre, emisor y punto de conversación. Entre dos obstáculos que flanqueen uno de esos corredores, exigir **0,90 m libres como mínimo**. Mantener la semilla o documentar el cambio visual. No inventar un par concreto con hueco de menos de 0,65 m sin calcular sus instancias.

### D07 · Partes móviles: emisor, extractor, postigos y compuertas

| Archivo y función | Qué falta | Cambio propuesto para revisión |
|---|---|---|
| `61.emisor` y `actualizar2` | Comprobación sin incidencia adicional: el postigo oscila entre 0,75 y 1,05 rad y vuelve a 0 al cerrarse. Su barrido cabe en la caja existente de semilado 0,3. | Mantener el sólido de S46. El centro de la hoja es `cx=P.x+.27-.25*sin(theta)`, `cz=P.z+.25-.25*cos(theta)`, con semimedidas giradas `.015,.25`. Para todo el intervalo, también las esquinas quedan dentro de `P.x/z±.3`. No añadir una segunda caja móvil aquí. |
| `61.crear5`, aro del extractor | El aro de radio 0,9 y grosor 0,07 no tiene sólido. Su abertura no debe rellenarse con una columna. | Dividirlo en **16 segmentos**. Centro de aro local a altura **1,05**. Por segmento, caja orientada del tramo tubular, radio de tubo **0,07** y extremos en `a=i*TAU/16` y `a=(i+1)*TAU/16`, transformados por `aro.rotation.y`. `fina=true`. Mantener libre el centro y el acceso al cierre de S49. |
| `62.torre`, postigo en 389–390 y animación en 472 | La reserva fina cubre la hoja completamente abierta; la caja de la lámpara cubre la cerrada. En ángulos intermedios, parte de la hoja queda fuera de ambas. | Reemplazar la reserva fija por caja móvil de semimedidas **0,475 × 0,04**, altura `centro.y±.5`. Bisagra ya calculada en `bisagra`. Centro `bisagra + RY(theta)*(.475,0,0)`, con `theta=postigo.rotation.y`; actualizar `ry,cs,sn`. No sumar ambas reservas permanentemente si estrechan el rellano. |
| `62.cisterna`, palanca y tabla en 324–340,469–471 | La palanca gira ±0,6 rad alrededor de su base; su extremo sale del semiancho 0,325 reservado. La tabla sube, pero el sólido de salida se mantiene hasta 1,5 aunque no hay tabla visible tan alta. | Para palanca: semiancho máximo respecto al poste `.65*sin(.6)+.06*cos(.6) = .4165`; usar `sol(3.5,2.5,.417,.12,.966,1.653,F)` como envolvente fija, o caja móvil. La cota máxima es `1+hypot(.65,.06)=1.6528`, no solo el extremo a 0,6 rad. Para la tabla, conservar un sólido con `hx=.4,hz=.06`, base en `S.h+.12+desplazamiento` y cima `base+.65`, siguiendo su subida real de 0 a 0,4. Sustituye el tapón de altura 1,5 si se decide que la abertura debe corresponder a la hoja. La salida sigue sin ser ruta peatonal. |

Los objetos móviles de `62.movil` no registran sus sólidos. Los apoyos y reservas actuales se colocan aparte en `poner`; añadir `k.sol` dentro de `movil` sin registrar y actualizar el resultado no arregla estas piezas.

### D08 · Obstáculos bajos, tela, barcas y huecos que no son rutas

| Pieza o lugar | Estado y propuesta concreta |
|---|---|
| `34.barca`, barca amarrada de `04.muelle` | No tiene sólido. Propuesta: tres cajas locales para el casco, con `z=[-1.9,-.95,.95,1.9]*e`; en cada tramo, semiancho máximo de la forma `0.625*e*(1-.85*(z/(1.9*e))²)`, evaluado en el punto del tramo más próximo a 0. Cotas `0..0.855*e`, `F`. Decidir si debe poder pisarse o embarcar fuera de escena. El sólido bajo actual no dispone de permiso «no pisar». |
| `62.cala`, barca varada | Ya tiene caja de semimedidas 0,65 × 1,9, desde 0,18 hasta 0,98. No está totalmente sin sólido. Si se centraliza el casco en `34.barca`, sustituir esta caja por sus tramos. No duplicar. |
| `34.saisen` en 24, barriles, `vasija`, carga, bancos | Todos tienen sólido o una corrección arriba. `fina` puede quitar aupado a los pequeños objetos que dirección quiera proteger, pero no evitará que se pisen si el controlador los acepta como suelo. En fase 4 decidir `pisar` por categoría. No agrandar su altura solo para que frenen. |
| `34.toldo`, tendederos de `04.aldea`, `chochin`, `shimenawa`, guirnaldas y campanillas | Hay tela/cuerda a altura corporal en algunas colocaciones. **Pregunta para el usuario:** confirmar con dirección qué telas deben ceder y cuáles bloquear. Si bloquean, registrar fragmentos de su malla real con `F`; no una pared desde el suelo hasta la cuerda. |
| Juncos, nenúfares y matas de huerto | Son vegetación flexible. Mantenerlos atravesables si dirección confirma esa excepción. Añadirles cilindros puede cerrar agua y cultivos sin dar una mejora de contacto útil. |
| Cima entre escalera y señal de Yoake | El vano del rellano mide `2.1+2*.12=2.34`; no se detecta hueco inferior a 0,65 en la entrada diseñada. Las dos escaleras están separadas en planta por 0,6 m entre bordes de peldaño; sus barandas ocupan esa separación. **No es un pasillo previsto**: el cambio de tramo se hace en el descanso de 6,4 × 2. Conservarlo así. |
| Camas de `62.casaAbierta` | Entre cada cama y pared lateral quedan **0,56 m**: `w/2-.09-(w/2-1.3+.65)`. No consta que deba pasarse por allí. El pasillo central de la vivienda mide **2,1 m**. Si se desea paso lateral, mover cada cama **0,35 m hacia el centro** deja 0,91 m lateral y 1,4 m central. Requiere decisión visual, no encoger su sólido. |
| Bancales de Yoake | Los centros distan 8 m; las vallas tienen ancho 7. Con los postes extremos de 0,05, el paso real mínimo entre vallas es **0,90 m**. No es un hueco inferior a 0,65. La entrada de 2,2 m también es suficiente. No ensanchar los sólidos por un margen global sin recalcularlo. |
| Espiral del faro | Las plataformas hexagonales tienen radio 1,7 y rotación `a`; el sólido cuadrado de semilado 1,45 no coincide con su contorno. Propuesta técnica: prisma hexagonal de radio **1,7**, espesor **0,36**, siguiendo `m.position.y` y `m.rotation.y`; si se mantienen cajas, descomponer ese hexágono en franjas de **0,10 m** y registrar cada franja con sus extremos calculados sobre sus seis aristas, sin rellenar las esquinas del cuadrado. Conservar activación por luz y actualizar las cotas con la oscilación de ±0,05. No cambiar el ancho efectivo de salto sin probar los capítulos 5 y 7. |

## 3. Integración y comprobación que corresponden a Claude

Orden propuesto: S01; piezas comunes y retirada de duplicados; sólidos ausentes de obra; decisión D01; revisión de D02–D08; recorrido y pruebas. Los números de las tablas son propuestas de integración, no cambios ya aplicados.

Para cerrar fase 1, recorrer aldea, muelle, faro, Pétalo, Escarcha, Marea, Duna y los siete sitios de Yoake a **3,2 y 6,8 m/s**. Incluir frenada frontal y oblicua, esquiva de **9,5 m/s**, salto bajo aleros, nado bajo muelles y regreso desde una plataforma. Revisar también con un paso de **0,05 s**; a 6,8 m/s el desplazamiento es 0,34 m y requiere tres subpasos de 0,12.

Ejecutar la sonda con parciales y revisar `?solidos`, incluyendo galerías y pisos elevados. La sonda actual filtra altura 0,25–1,7 sobre terreno/agua, excluye cuevas y usa margen **0,25 m**: puede ocultar diferencias de 0,05–0,20 m, cristales y barandas altas. Además solo recorre el material de obra; los objetos Lambert de `61` requieren inspección propia. No usar «sin grupos» como prueba suficiente de cero incidencias.

Criterios: cero obra rígida grande atravesable en rutas; mínimo **0,90 m** entre sólidos en pasos previstos con el radio actual; ninguna trepa/aupado sobre obra prohibida; apoyos altos con losa válida; sin bloquear registro del Pétalo, glifos, fragmentos, señal, extractor o corona. Después, pruebas de capítulos 1–7 y revisión en las tres calidades. Las comprobaciones de techo y de salto lateral de D02/D03 deben quedar resueltas o identificadas expresamente como pendientes; esta entrega no acredita su corrección.

## 4. Inventario para permisos de fase 4

Los nombres `pisar`, `aupar` y `trepar` expresan permisos de diseño. Todavía no son opciones admitidas por `sol`/`solC`. «Solo ruta» exige autorización por cara o tramo; no una etiqueta sobre el edificio completo.

| Lugar / pieza | Capítulo o uso | Pisar | Aupar / trepar a propósito | Lo que debe quedar prohibido |
|---|---|---|---|---|
| Rocas y apoyos de la aldea/inicio | Inicio y exploración | Sí | Sí, en apoyos seleccionados. `53-patio-inicio.js` tiene coberturas en **(−30,24), (−53,40)** y losas en **(−12,19), (−16,21), (−21,23)**. Distinguirlas de las rocas procedurales de Flora. | Usar el permiso para subirse a casas, carteles, faroles o muebles cercanos. |
| Acantilados naturales | Regiones ya abiertas | Sí en cornisas | Sí, por zonas aprobadas y con intención `{saltar}` hacia la pared. Identificar cada zona en los datos de terreno. | Escalar cualquier pendiente solo por superar un umbral; atravesar el Velo. |
| Ruta de Kiri y roca bajo su losa | Capítulo 6; registro y secundaria | Sí | Sí en roca y tramos de ascenso designados. Conservar corrientes de **(264,−214), (256,−230), (233,−287)** y llegada a la cima buscada junto a **(220,−316)**. | Trepar espigas, pórtico construido, hokora, mojón o farol como sustituto de la ruta. |
| Rutas de Duna y tres pirámides | Capítulo 3 | Sí en escalinatas, descansos y cimas | Solo ruta. Pirámides en **(204,262), (292,200), (226,298)**; escaleras de **3,2 m**, 13 peldaños y subida total **6,5 m**, mirando al santuario. | Trepar/auparse por caras laterales, cornisas y parte posterior. Resolver además el ascenso por saltos de D03. |
| Escalinata del templo de Duna | Capítulo 3 | Sí | Ascenso por los 20 peldaños de **2,4 m** de ancho y **0,3 m** de contrahuella. | Trepar las cuatro gradas, columnas, salón y cubierta por cualquier cara. |
| Espiral de luz del faro | Capítulos 5 y 7 | Sí cuando la plataforma esté activa | Sí a la ruta de saltos y a sus recuperaciones de borde autorizadas: **13 plataformas**, incremento vertical **1,32 m**. | Usar paredes, aleros, barandas o sōrin como atajo. Pisado cuando `c.on=false` o falta la luz requerida. |
| Losa del extractor y acceso a la corona | Capítulos 5 y 7 | Sí | Recuperación de borde si se aprueba; conservar conexión con la última plataforma y la losa superior de **17,5–18,1** sobre la base del faro. | Trepar aro, cierre, postes o lámparas. |
| Escaleras, descansos y plataforma de la señal de Yoake | Capítulo 4 | Sí | Ascenso por las dos escaleras de **20 peldaños** cada una, ancho **2,1 m**, subida **4+4 m**. | Trepar pilotes, barandas, caja de la señal, mástil o tejadillo. |
| Casas de Hinode y Yoake, casa común | Exploración y refugio | Sí en suelo, escalones y galerías; interiores realmente abiertos | No en paredes ni cubiertas | Trepa/aupado por cuerpo, chimenea, leña o farol para alcanzar el tejado. |
| Faro y templos de Pétalo/Marea/Escarcha | Historia y retos | Sí en escaleras, galerías y losas de ruta | No en cerramientos, columnas ni techo | Saltarse la ruta por obra. Conservar acceso al altar de Marea según D04. |
| Plataformas de refugio de Marea | Combate del capítulo 2 | Sí | Sí a su subida prevista. Hoy hay un peldaño de **0,55 m** y plataforma a **1,3 m**: si se adopta el escalón automático de 0,25 propuesto en M06, habrá que añadir peldaños o permitir aupado aquí. | Trepar el farol o convertir la plataforma de combate en obra bloqueada por una regla global. |
| Muelles, pasarela de Marea y mirador de Yoake | Tránsito y escenas | Sí | No requieren trepar. Conservar entradas desde tierra y salida del agua donde proceda. | Auparse a barandas, amarres, redes o pilotes como escalera. |
| Murales, estelas, atriles, altares y estatuas | Lectura e interacción | Solo apoyos de suelo aprobados | No | Trepa y aupado sobre las piezas de lectura o rituales. |
| Barandillas, vallas, postes, faroles, fogatas, compuertas | Obstáculos finos | No como apoyo intencional | No; `fina=true` ahora y permisos separados después | Que un duplicado sin marca o `Sol.suelo` las convierta en apoyo. Saltar una valla baja es una decisión distinta de treparla. |
| Cuevas y decoración rígida | Capítulos 1, 2 y 6 | Sí en suelo, losas y accesos | No en estalagmitas, cristales, emisor o techo. El portal rocoso exterior solo si pertenece a una zona autorizada. | Escalar la decoración para salir de la cueva o rellenar su hueco al corregirla. |
| Arcos, hoodoos, basalto, árboles secos y anillos de arena | Exploración opcional / combate | Según ruta elegida en D05 | **Pendiente de decisión por formación** | Autorizar todas las piezas por su altura o por tener aspecto de roca. |

## Cierre de la entrega

**Archivos tocados:** únicamente `docs/entregas_chatgpt/2026-11-03_auditoria_solidos.md`, creado para este encargo.

**Decisiones tomadas:** documentar correcciones por pieza; conservar el radio actual de 0,42 m; usar 0,90 m como mínimo práctico de paso de fase 1; distinguir bloqueo, suelo, aupado y trepa; no dar por resueltos techos, cornisas o rutas con `fina`. Las propuestas no están implementadas ni aprobadas por este informe.

**Preguntas abiertas:** D01, ampliación del Pétalo; D02, colisión de cubiertas y techo vertical; D03, alcance de la prohibición sobre saltos/planeo; D04, acceso del altar de Marea; D05–D06, formas naturales y pasos de cuevas; D07, contacto de piezas móviles; D08, telas, barcas y apoyos bajos. Las decisiones técnicas corresponden a Claude. Las decisiones de diseño pendientes figuran como **Pregunta para el usuario**; no añaden canon.
