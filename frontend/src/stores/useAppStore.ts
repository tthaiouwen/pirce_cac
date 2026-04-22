import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    appName: "云产品价格计算平台",
    initialized: false
  }),
  actions: {
    markInitialized() {
      this.initialized = true;
    }
  }
});
