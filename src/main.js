import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ru from './locales/ru.json';
import 'bootstrap/dist/css/bootstrap.min.css';


// Set up the translations
const messages = {
    en,
    ru,
  };
  
  // Create the i18n instance
  const i18n = createI18n({
    legacy: false,           // Use Composition API mode for Vue 3
    locale: 'en',            // Default language
    fallbackLocale: 'en',
    messages,
  });

const app = createApp(App).use(router);
app.use(i18n);
app.mount('#app');