<template></template>
<style lang="scss" scoped>
.linux-titlebar {
  color: var(--color-text);
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  --hover: #e6e6e6;
  --active: #cccccc;

  .logo {
    padding: 0 8px;
  }

  .title {
    padding: 8px;
    font-size: 12px;
    font-family: 'Segoe UI', 'Microsoft YaHei UI', 'Microsoft YaHei', sans-serif;
    justify-self: center;
    margin: 0 auto;
  }
  .controls {
    height: 32px;
    //margin-left: auto;
    justify-content: flex-end;
    display: flex;
    .button {
      height: 100%;
      width: 46px;
      font-size: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      -webkit-app-region: no-drag;
      &:hover {
        background: var(--hover);
      }
      &:active {
        background: var(--active);
      }
      &.close {
        &:hover {
          background: #c42c1b;
          color: rgba(255, 255, 255, 0.8);
        }
        &:active {
          background: #f1707a;
          color: #000;
        }
      }
    }
  }
}
[data-theme='dark'] .linux-titlebar {
  --hover: #191919;
  --active: #333333;
}
</style>
