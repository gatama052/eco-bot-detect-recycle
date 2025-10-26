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
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">IlmiGreen</h1>
              <p className="text-muted-foreground">AI untuk Bumi yang Lebih Hijau</p>
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
        <div className="bg-card rounded-3xl border border-border p-8 shadow-lg space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="image" className="space-y-6 mt-0">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              
              {selectedImage ? (
                <div className="space-y-4">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-2xl shadow-md"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full h-14 text-base"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Ganti Foto
                    </Button>
                  </label>
                </div>
              ) : (
                <label htmlFor="image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-full h-16 text-lg font-semibold border-2 hover:border-primary hover:bg-primary/5 transition-all"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="w-6 h-6 mr-3" />
                    📸 Ambil/Unggah Foto Sampah
                  </Button>
                </label>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("text")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Atau, masukkan deskripsi jenis sampah secara manual
                </button>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-6 mt-0">
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground block">
                  Deskripsikan sampah yang ingin Anda identifikasi
                </label>
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Contoh: botol plastik bekas minuman, kulit pisang, baterai bekas..."
                  className="min-h-32 resize-none rounded-2xl border-border focus-visible:ring-ring text-base"
                />
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("image")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Atau, unggah foto sampah
                </button>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={detectWaste}
            disabled={isDetecting}
            className="w-full rounded-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 hover:shadow-lg transition-all"
          >
            {isDetecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Mendeteksi Sampah...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2" />
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
