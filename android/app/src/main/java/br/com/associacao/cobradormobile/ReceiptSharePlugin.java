package br.com.associacao.cobradormobile;

import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Base64;

@CapacitorPlugin(name = "ReceiptShareNative")
public class ReceiptSharePlugin extends Plugin {
    @PluginMethod
    public void shareReceipt(PluginCall call) {
        String base64 = call.getString("base64");
        String fileName = call.getString("fileName", "recibo.pdf");
        String phone = call.getString("phone", "").replaceAll("\\D", "");
        String message = call.getString("message", "");
        String whatsappMode = call.getString("whatsappMode", "auto");

        if (base64 == null || base64.isEmpty() || phone.isEmpty()) {
            call.reject("Recibo ou telefone inválido.");
            return;
        }

        try {
            File receiptDir = new File(getContext().getCacheDir(), "receipts");
            if (!receiptDir.exists() && !receiptDir.mkdirs()) {
                call.reject("Não foi possível preparar o recibo.");
                return;
            }

            File receipt = new File(receiptDir, fileName.replaceAll("[^a-zA-Z0-9._-]", "_"));
            try (FileOutputStream output = new FileOutputStream(receipt)) {
                output.write(Base64.getDecoder().decode(base64));
            }

            Uri uri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                receipt
            );

            String selectedPackage = "com.whatsapp";
            if ("business".equals(whatsappMode)) {
                selectedPackage = "com.whatsapp.w4b";
            } else if ("auto".equals(whatsappMode)) {
                Intent businessCheck = getContext().getPackageManager()
                    .getLaunchIntentForPackage("com.whatsapp.w4b");
                Intent standardCheck = getContext().getPackageManager()
                    .getLaunchIntentForPackage("com.whatsapp");
                if (standardCheck == null && businessCheck != null) selectedPackage = "com.whatsapp.w4b";
            }

            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("application/pdf");
            intent.setPackage(selectedPackage);
            intent.putExtra(Intent.EXTRA_STREAM, uri);
            intent.putExtra(Intent.EXTRA_TEXT, message);
            intent.putExtra("jid", phone + "@s.whatsapp.net");
            intent.setClipData(ClipData.newRawUri("recibo", uri));
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            if (intent.resolveActivity(getContext().getPackageManager()) == null) {
                call.reject("O WhatsApp selecionado não foi encontrado.");
                return;
            }

            getActivity().startActivity(intent);
            JSObject result = new JSObject();
            result.put("opened", true);
            result.put("package", selectedPackage);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Não foi possível enviar o recibo ao contato.", error);
        }
    }
}
