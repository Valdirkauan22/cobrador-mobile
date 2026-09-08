package br.com.associacao.cobradormobile;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER = 4102;
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private Uri cameraUri;

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        webView = new WebView(this);
        setContentView(webView);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        webView.addJavascriptInterface(new AndroidBridge(), "Android");
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u=req.getUrl();
                if ("wa.me".equals(u.getHost()) || "whatsapp".equals(u.getScheme())) {
                    startActivity(new Intent(Intent.ACTION_VIEW,u)); return true;
                }
                return false;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback=cb;
                Intent files=new Intent(Intent.ACTION_GET_CONTENT).setType("*/*").addCategory(Intent.CATEGORY_OPENABLE);
                files.putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"image/*","application/pdf"});
                Intent camera=new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                try {
                    File f=File.createTempFile("comprovante_",".jpg",getCacheDir());
                    cameraUri=FileProvider.getUriForFile(MainActivity.this,getPackageName()+".files",f);
                    camera.putExtra(MediaStore.EXTRA_OUTPUT,cameraUri);
                    camera.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION|Intent.FLAG_GRANT_READ_URI_PERMISSION);
                } catch(Exception e) { camera=null; }
                Intent chooser=Intent.createChooser(files,"Selecionar comprovante");
                if(camera!=null)chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS,new Intent[]{camera});
                startActivityForResult(chooser,FILE_CHOOSER); return true;
            }
        });
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override protected void onActivityResult(int requestCode,int resultCode,Intent data) {
        super.onActivityResult(requestCode,resultCode,data);
        if(requestCode!=FILE_CHOOSER||fileCallback==null)return;
        Uri[] result=null;
        if(resultCode==RESULT_OK){
            if(data==null||data.getData()==null){if(cameraUri!=null)result=new Uri[]{cameraUri};}
            else if(data.getClipData()!=null){ClipData c=data.getClipData();result=new Uri[c.getItemCount()];for(int i=0;i<c.getItemCount();i++)result[i]=c.getItemAt(i).getUri();}
            else result=new Uri[]{data.getData()};
        }
        fileCallback.onReceiveValue(result); fileCallback=null; cameraUri=null;
    }

    @Override public void onBackPressed() { if(webView.canGoBack())webView.goBack();else super.onBackPressed(); }

    public class AndroidBridge {
        @JavascriptInterface public void sharePdf(String base64,String fileName,String message) {
            runOnUiThread(() -> {
                try {
                    String safe=fileName.replaceAll("[^a-zA-Z0-9._-]","_");
                    File dir=new File(getCacheDir(),"recibos"); if(!dir.exists())dir.mkdirs();
                    File pdf=new File(dir,safe);
                    byte[] bytes=Base64.decode(base64,Base64.DEFAULT);
                    try(FileOutputStream out=new FileOutputStream(pdf)){out.write(bytes);}
                    Uri uri=FileProvider.getUriForFile(MainActivity.this,getPackageName()+".files",pdf);
                    Intent send=new Intent(Intent.ACTION_SEND).setType("application/pdf");
                    send.putExtra(Intent.EXTRA_STREAM,uri); send.putExtra(Intent.EXTRA_TEXT,message);
                    send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(Intent.createChooser(send,"Enviar recibo"));
                } catch(Exception e) { Toast.makeText(MainActivity.this,"Não foi possível compartilhar o recibo.",Toast.LENGTH_LONG).show(); }
            });
        }
    }
}
