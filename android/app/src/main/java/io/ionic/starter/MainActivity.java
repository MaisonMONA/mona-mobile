package io.ionic.starter;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        initialPlugins.add(MonaGeofencePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
