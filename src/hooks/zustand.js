import { create } from "zustand";

const Zustand = create(( set, get ) => ({
  shoot: true, setShoot: () => set({ shoot: !get().shoot }),
  map: "ticker", setMap: state => set({ map: state })
}))

export default Zustand