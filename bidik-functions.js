    /* =========================================================
       AKSI TOMBOL BIDIK
       ========================================================= */

    async function aksiBidik(jenis, web) {

        const textarea =
            document.getElementById(
                'input-bidik-' + web
            );

        const inputNilai =
            document.getElementById(
                'nilai-input-' + web
            );

        const bidikData =
            textarea.value;

        const nilaiData =
            inputNilai.value;


        if (!bidikData || !nilaiData) {
            alert("Data bidik atau nilai tidak lengkap!");
            return;
        }


        const dataGabung = bidikData + "#" + nilaiData;

        // CUSTOM CONFIRMATION
        const confirmMsg = 
            "Yakin ingin bidik " + jenis + "?\n\n" +
            "Data: " + dataGabung + "\n\n" +
            "Saldo akan berkurang jika berhasil.";

        if (!confirm(confirmMsg)) {
            return;
        }

        // COPY DATA KE CLIPBOARD
        await copyToClipboard(dataGabung);
        console.log("Data copied to clipboard: " + dataGabung);

        // KIRIM KE GAS
        await submitBidik(jenis, dataGabung, web);
    }


    /* =========================================================
       COPY TO CLIPBOARD
       ========================================================= */

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            console.log("Berhasil copy: " + text);
        } catch (err) {
            console.log("Gagal copy: " + err);
        }
    }


    /* =========================================================
       SUBMIT BIDIK KE GAS
       ========================================================= */

    async function submitBidik(jenis, bidikData, web) {

        const loader =
            document.getElementById('loader');


        loader.innerText =
            "Memproses bidik " + jenis + "...";

        loader.style.display =
            'block';


        try {

            const urlReq =
                `${GAS_PROXY_URL}?action=bidik${jenis}&user=${encodeURIComponent(sesiAktif.userweb1)}&pass=${encodeURIComponent(sesiAktif.passweb1)}&data=${encodeURIComponent(bidikData)}`;


            let response =
                await fetch(urlReq);

            let result =
                await response.json();


            loader.style.display =
                'none';


            if (result.status === 'success') {

                console.log(
                    "Bidik " + jenis + " berhasil dikirim!"
                );

                // Refresh saldo untuk verifikasi
                setTimeout(function() {
                    cekSaldoTarget(web);
                }, 1000);

            } else {

                console.log(
                    "Bidik gagal: " + 
                    (result.message || "Kesalahan sistem")
                );

                alert(
                    "Bidik gagal: " +
                    (result.message || "Kesalahan sistem")
                );
            }

        } catch (err) {

            loader.style.display =
                'none';

            console.log(
                "Error Jaringan: " + err.message
            );

            alert("Error Jaringan: " + err.message);
        }
    }