import { create } from "zustand";

export const Zustand = create(( set, get ) => ({
  shoot: true, setShoot: () => set({ shoot: !get().shoot }),
  map: "ticker", setMap: state => set({ map: state })
}))