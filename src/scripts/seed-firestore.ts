import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// You'll need to paste your firebaseConfig here if running locally
const firebaseConfig = {
  // Your config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEMO_ASSETS = [
  {
    name: "Phantom_Stalker_AI",
    category: "Game AI",
    price: "0",
    description: "High-performance stealth-based enemy AI logic with sensory detection systems.",
    externalDownloadUrl: "https://github.com/krishnaprasanth7102/forgotten",
    img: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=400",
    contributorId: "SYSTEM",
    contributorName: "GameSmith_Core",
    downloadCount: 12400,
    rating: 4.9
  },
  {
    name: "Cyber_Mecha_Blade",
    category: "3D Models",
    price: "12.00",
    description: "Ultra-detailed katana with PBR textures and optimized LODs for high-speed action.",
    externalDownloadUrl: "https://github.com/krishnaprasanth7102/forgotten",
    img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400",
    contributorId: "SYSTEM",
    contributorName: "GameSmith_Core",
    downloadCount: 2400,
    rating: 5.0
  },
  {
    name: "Sentient_NPC_Core",
    category: "Game AI",
    price: "45.00",
    description: "A neural-network based NPC brain capable of complex environmental interactions.",
    externalDownloadUrl: "https://github.com/krishnaprasanth7102/forgotten",
    img: "https://images.unsplash.com/photo-1620712943543-bcc4628c9758?auto=format&fit=crop&q=80&w=400",
    contributorId: "SYSTEM",
    contributorName: "GameSmith_Core",
    downloadCount: 1100,
    rating: 4.9
  }
];

async function seed() {
  console.log("Initializing Seeding Protocol...");
  const bossesRef = collection(db, "bosses");
  
  for (const asset of DEMO_ASSETS) {
    await addDoc(bossesRef, {
      ...asset,
      createdAt: serverTimestamp()
    });
    console.log(`Deployed: ${asset.name}`);
  }
  
  console.log("Seeding Complete. Tactical Marketplace Populated.");
}

seed().catch(console.error);
