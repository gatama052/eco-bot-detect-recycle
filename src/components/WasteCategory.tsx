import { Leaf, Recycle, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

type WasteCategoryProps = {
  type: "organik" | "anorganik" | "b3";
};

const categories = {
  organik: {
    icon: Leaf,
    title: "Organik",
    description: "Sisa makanan, daun, dan bahan alami yang bisa dikompos",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  anorganik: {
    icon: Recycle,
    title: "Anorganik",
    description: "Plastik, kertas, dan logam yang bisa didaur ulang",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  b3: {
    icon: Shield,
    title: "B3",
    description: "Bahan berbahaya yang perlu penanganan khusus",
    bgColor: "bg-red-50",
    iconColor: "text-red-500",
  },
};

const WasteCategory = ({ type }: WasteCategoryProps) => {
  const category = categories[type];
  const Icon = category.icon;

  return (
    <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-border">
      <div className={`w-16 h-16 ${category.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-8 h-8 ${category.iconColor}`} />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{category.title}</h3>
      <p className="text-sm text-muted-foreground">{category.description}</p>
    </Card>
  );
};

export default WasteCategory;
