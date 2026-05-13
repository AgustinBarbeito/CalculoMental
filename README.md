# Cálculo mental

Aplicación móvil (React Native + Expo) para un juego de **cálculo mental** bajo presión de tiempo: mide precisión, velocidad de reacción y puntaje. **No utiliza conexión a internet**; los datos se guardan solo en el dispositivo.

**Autor:** Agustin Barbeito— *Desarrollo de Aplicaciones I*.

---

## Stack tecnológico


| Área         | Elección                                                             |
| ------------ | -------------------------------------------------------------------- |
| Framework    | **Expo SDK 54** (compatible con **Expo Go** actual en iOS y Android) |
| Lenguaje     | **TypeScript**                                                       |
| UI           | **React Native** 0.81, **React** 19                                  |
| Navegación   | **React Navigation** (native stack)                                  |
| Persistencia | **AsyncStorage** (`@react-native-async-storage/async-storage`)       |
| Gestos       | **react-native-gesture-handler** (recomendado con navegación nativa) |


---

## Requisitos

- **Node.js** 18 o superior  
- **Expo Go** en el teléfono (misma versión de SDK que el proyecto)  

---

## Instalación y ejecución

```bash
cd mental-math-game
npm install
npx expo start
```

- Escanear el código QR con **Expo Go** (desde la app, no solo con la cámara del sistema, si el enlace `exp://` no se abre).  
- Teclas útiles en la terminal de Expo: `a` (Android), `i` (iOS), `w` (navegador).

Si hubo un cambio grande de versiones o instalación inconsistente:

```bash
rm -rf node_modules package-lock.json   # en PowerShell: Remove-Item ...
npm install
npx expo install --fix
```

En **Windows**, si `npm` no se encuentra en Git Bash, asegurate de que Node esté en el PATH o usá PowerShell.

---

## Funcionalidades implementadas

### Configuración de partida

- **Tres pasos en una sola pantalla** (sin atajos desde el inicio):  
  1. **Modo de juego** (cuatro opciones con descripción breve).
  2. **Dificultad** (fácil, medio, difícil).
  3. **Intensidad**: cantidad de preguntas por ronda (1–30) *o* tiempo total en segundos (solo en **contra reloj**).
- Los pasos posteriores se habilitan en orden; **Comenzar** solo se activa cuando modo y dificultad están elegidos.

### Modos de juego


| Modo                  | Descripción                                                                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Clásico**           | Teclado numérico en pantalla; el usuario ingresa el resultado.                                                                                                                                |
| **Verdadero / falso** | Se muestra una igualdad; el usuario indica si es correcta.                                                                                                                                    |
| **Opción múltiple**   | Cuatro resultados posibles; uno es el correcto.                                                                                                                                               |
| **Contra reloj**      | Tiempo total de sesión configurable; **un error incorrecto** finaliza la ronda; el tiempo por operación sigue la dificultad. Los timeouts penalizan pero **no** cortan la ronda en este modo. |


### Dificultad y operaciones

- Generación **pseudoaleatoria** de operaciones `+`, `−`, `×`, `÷` con **enteros** (en división, cociente entero garantizado).  
- Rangos y tipos de operación acotados según dificultad (fácil más acotado; difícil más exigente).  
- **Tiempo máximo por operación** según dificultad (aprox.: 12 s / 10 s / 7 s).

### Puntaje (según consigna)


| Situación                                              | Puntos   |
| ------------------------------------------------------ | -------- |
| Correcta y rápida (menos del 75 % del tiempo asignado) | **+100** |
| Correcta dentro del tiempo                             | **+70**  |
| Incorrecta                                             | **−30**  |
| Sin respuesta (timeout)                                | **−50**  |


### Resultados y persistencia

- Al terminar la ronda: **resumen** con puntaje, precisión, totales y tiempo medio de reacción; récord local para esa combinación modo + dificultad.  
- **Historial** de rondas recientes guardado en el dispositivo.  
- **Mejor puntaje** por par modo + dificultad.  
- **Reinicio de flujo** desde “Jugar otra vez” o “Inicio”.

### Ajustes y apariencia

- Tema **claro**, **oscuro** o **según sistema** (preferencia persistida en AsyncStorage).  
- Acento de marca **#2F8886** (verde azulado) aplicado con criterio (botones principales, estados activos, barras de tiempo).

### Web

- Vista en navegador con **marco tipo teléfono** (ancho máximo ~390 px, centrado) para facilitar pruebas y capturas.

---

## Decisiones de diseño

### Identidad visual y tono

- Estética **colorida pero contenida**: fondos claros u oscuros neutros, **acento saturado puntual** (#2F8886), superficies secundarias en tonos suaves (`accentSoft`) para no competir con la operación ni el temporizador.  
- Objetivo: sensación **juguetona y desafiante**, con interfaz **limpia** y tipografía legible bajo estrés (jerarquía clara: operación y timer vs. metadatos).

### Navegación

- **Stack nativo** entre Inicio → Configuración → Juego → Resumen; Historial y Ajustes accesibles desde Inicio.  
- En **juego**, sin botón atrás del header (evita salidas accidentales).  
- En **resumen**, **sin barra de navegación** y **sin scroll**: una sola pantalla compacta para evitar solapamientos con el safe area y el comportamiento del `ScrollView` al llegar a los botones inferiores.

### Flujo de configuración

- Un solo lugar para definir partida, con **orden explícito** (1 → 2 → 3) para cumplir la consigna y reducir errores de uso, sin depender de atajos desde la pantalla principal.

### Modelo de datos local

- Claves prefijadas (`@mental_math_`*) para **historial** (lista acotada) y **mejores puntajes** por clave `modo::dificultad`.  
- Sin backend ni red: cumple restricción de **persistencia exclusivamente local**.

### Accesibilidad práctica

- Botones amplios en modos de elección (V/F, múltiple opción).  
- Feedback breve tras cada respuesta (correcto / incorrecto / timeout) antes de la siguiente pregunta.

---

## Estructura del código (resumen)

```
mental-math-game/
├── App.tsx                 # Raíz, tema web tipo móvil, gesture-handler
├── app.json                # Metadatos Expo
├── src/
│   ├── components/         # Screen, PrimaryButton, TimerBar, NumericKeypad
│   ├── context/            # ThemeContext (claro / oscuro / sistema)
│   ├── game/               # Dificultad, generador de preguntas, puntaje
│   ├── hooks/              # useGameSession (lógica de ronda y temporizadores)
│   ├── navigation/         # RootNavigator, tipos de rutas
│   ├── screens/            # Home, Setup, Game, Summary, Stats, Settings
│   ├── storage/            # AsyncStorage (historial y récords)
│   ├── theme/              # Paleta y espaciados
│   └── types/              # Tipos del dominio del juego
```

