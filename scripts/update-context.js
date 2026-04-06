const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, '../UNIVERSAL_CONTEXT.md');

const intro = `# Contexto Universal del Proyecto: sintesis-mobile

## Descripción General
Este es un proyecto móvil construido con **React Native** usando el framework **Expo**, organizado bajo la arquitectura de **Expo Router** (basada en el sistema de navegación por archivos en el directorio \`app/\`).

## Tecnologías y Librerías Principales
El proyecto utiliza las siguientes tecnologías clave (resumen de \`package.json\`):

*   **Core**: React, React Native, Expo
*   **Navegación**: \`expo-router\`
*   **Manejo de Estado Global**: \`zustand\`
*   **Gestión de Peticiones y Caché**: \`@tanstack/react-query\`
*   **Peticiones HTTP**: \`axios\`
*   **Manejo y Validación de Formularios**: \`react-hook-form\`, \`@hookform/resolvers\`, \`zod\`
*   **Iconos e UI**: \`lucide-react-native\`, \`@expo/vector-icons\`
*   **Animaciones/Gestos**: \`react-native-reanimated\`, \`react-native-gesture-handler\`

## Estructura de Directorios Clave

\`\`\`text
sintesis-mobile/
│── app/                       (Rutas de la aplicación / UI)
│   │── (auth)/                (Autenticación)
│   │── (student)/             (Módulo Estudiantes)
│   │── (teacher)/             (Módulo Profesores)
│   └── (trainee)/             (Módulo Practicantes/Trainees)
│
│── src/                       (Lógica de negocio y código reutilizable)
│   │── api/                   (Agrupación de peticiones backend)
│   │── store/                 (Estado global con Zustand)
│   │── models/                (Interfaces y Tipos de TypeScript)
│   │── components/            (Componentes visuales propios)
│   │── hooks/                 (Custom Hooks para React Query o lógica)
│   │── theme/                 (Configuración visual: colores, tipografías)
│   └── utils/                 (Funciones de apoyo y utilidades)
│
└── components/                (Componentes visuales base default de expo)
\`\`\`

## Convenciones del Proyecto
1.  **Arquitectura Visual**: Las pantallas están definidas en \`app/\` mientras que la lógica pura, integraciones a API, estado y componentes están abstraídos en \`src/\`.
2.  **Rutas Agrupadas**: Se usan sub-carpetas entre paréntesis como \`(auth)\`, \`(student)\`, \`(teacher)\`, \`(trainee)\` para crear segmentos lógicos de rutas que comparten el mismo Layout (archivos \`_layout.tsx\`) sin alterar la URL.

## Código Fuente Fundamental
`;

const specificFiles = [
    'app.json',
    'tsconfig.json'
];

const foldersToTrack = [
    'app',
    'src'
];

let content = intro;

// Helper function to dynamically read all files in a directory
function getFiles(dir, filesList = []) {
    if (!fs.existsSync(dir)) return filesList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getFiles(fullPath, filesList);
        } else {
            // Include only .ts and .tsx files, ignore default +not-found.tsx
            if ((fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) && !fullPath.includes('+not-found')) {
                filesList.push(fullPath);
            }
        }
    }
    return filesList;
}

const baseDir = path.join(__dirname, '..');

const allFilesToRender = [...specificFiles.map(f => path.join(baseDir, f))];

foldersToTrack.forEach(folder => {
    getFiles(path.join(baseDir, folder), allFilesToRender);
});

allFilesToRender.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).replace('.', '');
        const lang = (ext === 'ts' || ext === 'tsx') ? 'typescript' : (ext === 'json' ? 'json' : 'text');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
        
        content += `\n### \`${relativePath}\`\n\n\`\`\`${lang}\n${fileContent}\n\`\`\`\n`;
    }
});

fs.writeFileSync(outputFile, content, 'utf8');
console.log('UNIVERSAL_CONTEXT.md actualizado exitosamente con todos los archivos de app/ y src/ !');
