package br.com.associacao.cobradormobile;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(ReceiptSharePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
