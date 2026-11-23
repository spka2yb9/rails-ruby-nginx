/* aws-learning の useConsole（console/store.ts）は create()(...) で作られ、教材側は getState() / setState() しか使わない。
   React のフックを含まない createStore を同じ名前で渡す */
export { createStore as create } from 'zustand/vanilla';
