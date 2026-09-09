function doGet(e) {
  try {
    // 1. Ambil URL dinamis dari Supabase (kolom urlweb3 di baris teratas yang terisi)
    var url = getUrlWeb3Supabase();
    
    // 2. Fetch konten HTML dari URL dinamis tersebut
    var response = UrlFetchApp.fetch(url);
    var html = response.getContentText();
    
    var blocks = html.split(/class="[^"]*lottery-/i);
    var dataList = [];
    
    for (var i = 1; i < blocks.length; i++) {
      var block = blocks[i];
      
      // Ambil ID
      var idMatch = block.match(/^(\d+)/);
      if (!idMatch) continue;
      var id = idMatch[1]; 
      
      // Ambil Nama Ikan / Pasaran
      var namaMatch = block.match(/<div[^>]*style="[^"]*font-size:\s*18px[^>]*>([^<]+)<\/div>/i);
      var nama = namaMatch ? namaMatch[1].trim() : "";
      
      if (nama) {
        dataList.push({
          id: id,
          nama: nama
        });
      }
    }
    
    // Kembalikan data dalam format JSON yang bersih
    var output = ContentService.createTextOutput(JSON.stringify(dataList));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
    
  } catch (error) {
    var errorOutput = ContentService.createTextOutput(JSON.stringify({ error: error.toString() }));
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    return errorOutput;
  }
}

// ==========================================
// FUNGSI KHUSUS: AMBIL URLWEB3 DARI SUPABASE
// ==========================================
function getUrlWeb3Supabase() {
  var SUPABASE_URL = 'https://qhlutwgdpspukgjelzjw.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_3GNWRYLQQ3b_OcNGGNd3Yw_T8LzbuLG';

  // Hanya mengambil kolom urlweb3 dari tabel users_config
  var apiUrl = SUPABASE_URL + '/rest/v1/users_config?select=urlweb3';

  var response = UrlFetchApp.fetch(apiUrl, {
    "method": "get",
    "headers": {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json"
    },
    "muteHttpExceptions": true
  });

  var httpCode = response.getResponseCode();
  var responseText = response.getContentText();

  if (httpCode < 200 || httpCode >= 300) {
    throw new Error("Supabase HTTP " + httpCode + " | " + responseText.substring(0, 500));
  }

  var hasil = JSON.parse(responseText);

  if (!hasil || hasil.length === 0) {
    throw new Error("Supabase tidak mengembalikan data users_config.");
  }

  // Cari baris teratas yang mempunyai isi urlweb3 (melewati baris yang null/kosong)
  var rawUrl = null;
  for (var i = 0; i < hasil.length; i++) {
    if (hasil[i] && hasil[i].urlweb3 && hasil[i].urlweb3.trim() !== "") {
      rawUrl = hasil[i].urlweb3.trim();
      break;
    }
  }

  if (!rawUrl) {
    throw new Error("Tidak ditemukan record urlweb3 yang terisi di Supabase.");
  }

  // Bersihkan dari http://, https://, www., dan path tambahan
  var bersih = rawUrl
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0];

  // Gabungkan dengan awalan https:// dan path /wap
  return "https://" + bersih + "/wap";
}