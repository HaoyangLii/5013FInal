import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrXcOB7yaMOxl8L3Ne4oNywIfMVdmQKso",
  authDomain: "mydata5013.firebaseapp.com",
  projectId: "mydata5013"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const petsRef = collection(db, "pets");

Vue.createApp({
  data() {
    return {
      pets: [],
      currentIndex: 0,
      newPet: {
        name: "",
        emoji: "",
        color: "#ffcc00"
      },
      emojiOptions: ["🐶", "🐱", "🐰", "🦊", "🐸","🐎","🦌","🦏","🐐","🐑","🐏","🦘","🦥"],
      editingName: false,
      editedName: ""
    };
  },
  computed: {
    currentPet() {
      return this.pets[this.currentIndex] || null;
    }
  },
  methods: {
    async fetchPets() {
      const snapshot = await getDocs(petsRef);
      this.pets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    async addPet() {
      const stats = { health: 100, mood: 100, energy: 100 };
      const pet = { ...this.newPet, stats };
      await addDoc(petsRef, pet);
      this.newPet = { name: "", emoji: "", color: "#ffcc00" };
      this.fetchPets();
    },
    prevPet() {
      if (this.currentIndex > 0) this.currentIndex--;
    },
    nextPet() {
      if (this.currentIndex < this.pets.length - 1) this.currentIndex++;
    },
    async updateStat(type) {
      const stats = { ...this.currentPet.stats };
      if (type === "feed") {
        stats.health = Math.min(100, stats.health + 10);
        stats.energy = Math.min(100, stats.energy + 5);
      } else if (type === "play") {
        stats.mood = Math.min(100, stats.mood + 10);
        stats.energy = Math.max(0, stats.energy - 5);
      } else if (type === "sleep") {
        stats.energy = Math.min(100, stats.energy + 15);
        stats.mood = Math.max(0, stats.mood - 5);
      }
      const docRef = doc(db, "pets", this.currentPet.id);
      await updateDoc(docRef, { stats });
      this.fetchPets();
    },
    async deletePet() {
      if (!confirm("Are you sure you want to delete this pet?")) return;
      const docRef = doc(db, "pets", this.currentPet.id);
      await deleteDoc(docRef);
      this.currentIndex = Math.max(0, this.currentIndex - 1);
      this.fetchPets();
    },
    async saveName() {
      const docRef = doc(db, "pets", this.currentPet.id);
      await updateDoc(docRef, { name: this.editedName });
      this.editingName = false;
      this.fetchPets();
    }
  },
  mounted() {
    this.fetchPets();
  },
  watch: {
    currentPet(newPet) {
      if (newPet) this.editedName = newPet.name;
    }
  }
}).mount("#app");