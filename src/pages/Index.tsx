import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Upload, MessageCircle, Sparkles } from "lucide-react";
import WasteCategory from "@/components/WasteCategory";
import DetectionResult from "@/components/DetectionResult";
import { toast } from "sonner";

type DetectionResponse = {
  jenis: "Organik" | "Anorganik" | "B3";
  penjelasan: string;
  tips: string;
};

const Index = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [activeTab, setActiveTab] = useState("image");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectWaste = async () => {
    if (activeTab === "image" && !selectedImage) {
      toast.error("Silakan upload gambar terlebih dahulu");
      return;
    }
    
    if (activeTab === "text" && !textInput.trim()) {
      toast.error("Silakan masukkan deskripsi sampah");
      return;
    }

    setIsDetecting(true);
    setResult(null);

    try {
      const DETECT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-waste`;
      const response = await fetch(DETECT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          input: activeTab === "image" ? selectedImage : textInput,
          type: activeTab,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mendeteksi sampah");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Sampah berhasil dideteksi!");

    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat mendeteksi sampah");
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">IlmiGreen</h1>
              <p className="text-xs text-muted-foreground">AI untuk Bumi yang Lebih Hijau</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Kenali Sampahmu,{" "}
            <span className="text-primary">Selamatkan Bumi</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gunakan kekuatan AI untuk mengidentifikasi jenis sampah dan belajar cara mengelolanya
            dengan benar. Mari bersama wujudkan lingkungan yang lebih hijau!
          </p>
        </div>

        {/* Waste Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WasteCategory type="organik" />
          <WasteCategory type="anorganik" />
          <WasteCategory type="b3" />
        </div>

        {/* Detection Section */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="image" className="rounded-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload Gambar
              </TabsTrigger>
              <TabsTrigger value="text" className="rounded-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Tulis Deskripsi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-1">
                        Klik untuk upload atau drag & drop
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG (Maks. 5MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Deskripsikan sampah yang ingin Anda identifikasi, misalnya: 'botol plastik bekas minuman'"
                className="min-h-32 resize-none rounded-2xl border-border focus-visible:ring-ring"
              />
            </TabsContent>
          </Tabs>

          <Button
            onClick={detectWaste}
            disabled={isDetecting}
            className="w-full mt-4 rounded-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            {isDetecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Mendeteksi...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Deteksi Sampah
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <DetectionResult
            jenis={result.jenis}
            penjelasan={result.penjelasan}
            tips={result.tips}
          />
        )}

        {/* Footer */}
        <footer className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            IlmiGreen — Bersama AI, Wujudkan Bumi yang Lebih Hijau 🌱
          </p>
        </footer>
      </main>

      {/* Floating Chat Button */}
      <Button
        onClick={() => navigate("/chat")}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:scale-110 transition-transform"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Index;
