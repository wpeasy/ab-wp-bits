import { mount } from 'svelte'
import '../../wpea/wpea-framework.css'
import './app.css'
import App from './App.svelte'

// Set body initial styles
document.body.style.setProperty('color-scheme', 'light dark');
document.body.style.padding = '0';
document.body.style.margin = '0';

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
