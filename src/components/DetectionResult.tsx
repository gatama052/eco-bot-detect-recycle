import { Card } from "@/components/ui/card";
import { Leaf, Recycle, Shield, Sparkles } from "lucide-react";

type DetectionResultProps = {
  jenis: "Organik" | "Anorganik" | "B3";
  penjelasan: string;
  tips: string;
};

const DetectionResult = ({ jenis, penjelasan, tips }: DetectionResultProps) => {
  const getIcon = () => {
    switch (jenis) {
      case "Organik":
        return <Leaf className="w-10 h-10 text-green-600" />;
      case "Anorganik":
        return <Recycle className="w-10 h-10 text-green-600" />;
      case "B3":
        return <Shield className="w-10 h-10 text-red-500" />;
    }
  };

  const getBgColor = () => {
    return jenis === "B3" ? "bg-red-50" : "bg-green-100";
  };

  return (
    <Card className="p-6 border-border animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 ${getBgColor()} rounded-full flex items-center justify-center flex-shrink-0`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Jenis Sampah: {jenis}</h3>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Penjelasan:</h4>
              <p className="text-muted-foreground">{penjelasan}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Tips Pengelolaan:</h4>
              <p className="text-muted-foreground">{tips}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DetectionResult;
