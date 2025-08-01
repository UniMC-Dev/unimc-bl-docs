import DefaultTheme from "vitepress/theme";
import "./style/index.css";
import Linkcard from "./components/Linkcard.vue";
import CommandExplorer from './components/CommandExplorer.vue';
import { h } from 'vue';
import Mylayout from "./components/Mylayout.vue";

export default {
  ...DefaultTheme,
  Layout() {
    return h(Mylayout, null, {

    });
  },
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('Linkcard', Linkcard);
    app.component('CommandExplorer', CommandExplorer);
    app.component('MyLayout', Mylayout);
  }
}