import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'



// https://vite.dev/config/
export default defineConfig(

   {
  plugins: [ tailwindcss(),react()],
}
)
// Vite config with Material Tailwind
// export default defineConfig(
//   withMT({
//     plugins: [react()],
//     resolve: {
//       dedupe: ['react', 'react-dom'], // fixes multiple React versions issue
//     },
//   })
// )
