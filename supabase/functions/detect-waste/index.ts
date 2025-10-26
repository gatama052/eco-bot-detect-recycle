import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY tidak dikonfigurasi");
    }

    let messages;
    
    if (type === "image") {
      // Deteksi dari gambar
      messages = [
        {
          role: "system",
          content: "Kamu adalah IlmiGreen AI, asisten cerdas untuk klasifikasi sampah. Analisis gambar dan tentukan jenis sampah (Organik, Anorganik, atau B3). Berikan penjelasan singkat dan tips pengelolaan dalam Bahasa Indonesia yang ramah dan edukatif."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identifikasi jenis sampah dalam gambar ini dan berikan tips pengelolaannya."
            },
            {
              type: "image_url",
              image_url: { url: input }
            }
          ]
        }
      ];
    } else {
      // Deteksi dari teks
      messages = [
        {
          role: "system",
          content: "Kamu adalah IlmiGreen AI, asisten cerdas untuk klasifikasi sampah. Berdasarkan deskripsi, tentukan jenis sampah (Organik, Anorganik, atau B3). Berikan penjelasan singkat dan tips pengelolaan dalam Bahasa Indonesia yang ramah dan edukatif."
        },
        {
          role: "user",
          content: `Identifikasi jenis sampah: ${input}`
        }
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "classify_waste",
              description: "Klasifikasi jenis sampah dan berikan informasi pengelolaan",
              parameters: {
                type: "object",
                properties: {
                  jenis: {
                    type: "string",
                    enum: ["Organik", "Anorganik", "B3"],
                    description: "Jenis sampah yang terdeteksi"
                  },
                  penjelasan: {
                    type: "string",
                    description: "Penjelasan singkat tentang jenis sampah (maks 50 kata)"
                  },
                  tips: {
                    type: "string",
                    description: "Tips pengelolaan atau daur ulang (maks 50 kata)"
                  }
                },
                required: ["jenis", "penjelasan", "tips"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "classify_waste" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Terlalu banyak permintaan. Silakan coba lagi nanti." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Kredit habis. Silakan tambahkan kredit ke workspace Lovable AI Anda." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Tidak ada hasil dari AI");

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Terjadi kesalahan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
