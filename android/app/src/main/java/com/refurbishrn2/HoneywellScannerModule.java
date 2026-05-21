package com.refurbishrn2;

import android.os.Build;
import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.honeywell.aidc.AidcManager;
import com.honeywell.aidc.BarcodeFailureEvent;
import com.honeywell.aidc.BarcodeReadEvent;
import com.honeywell.aidc.BarcodeReader;
import com.honeywell.aidc.ScannerNotClaimedException;
import com.honeywell.aidc.ScannerUnavailableException;
import com.honeywell.aidc.AidcManager.CreatedCallback;

import java.util.HashMap;
import java.util.Map;

public class HoneywellScannerModule extends ReactContextBaseJavaModule implements BarcodeReader.BarcodeListener  {
    static final String TAG = "SCAN";

    // Debugging
    private static final boolean D = true;

    private static BarcodeReader barcodeReader;
    private AidcManager manager;
    private BarcodeReader reader;
    private ReactApplicationContext mReactContext;

    private static final String BARCODE_READ_SUCCESS = "barcodeReadSuccess";
    private static final String BARCODE_READ_FAIL = "barcodeReadFail";

    public HoneywellScannerModule(ReactApplicationContext reactContext) {
        super(reactContext);

        Log.e(TAG, " CONSTRUTOR ");

        mReactContext = reactContext;

        try {
            AidcManager.create(mReactContext, new AidcManager.CreatedCallback() {
                @Override
                public void onCreated(AidcManager aidcManager) {
                    Log.e(TAG, "AIDC Scanner criado");
                    manager = aidcManager;
                    reader = manager.createBarcodeReader();

                    if(reader != null){
                        reader.addBarcodeListener(HoneywellScannerModule.this);
                        try {
                            reader.claim();
                            //promise.resolve(true);
                        } catch (ScannerUnavailableException e) {
                            //promise.resolve(false);
                            e.printStackTrace();
                        }
                    }
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "DEU RUIM NO AIDC");
        }
    }

    @Override
    public String getName() {
                Log.e(TAG, " GTNAME ");

        return "HoneywellScannerModule";
    }
/*
    private class scannerCriadoCallback {
        @Override
        public void onCreated(AidcManager aidcManager) {
            manager = aidcManager;
            reader = manager.createBarcodeReader();
            if(reader != null){
                reader.addBarcodeListener(HoneywellScannerModule.this);
                try {
                    reader.claim();
                    promise.resolve(true);
                } catch (ScannerUnavailableException e) {
                    promise.resolve(false);
                    e.printStackTrace();
                }
            }
        }
    }
*/
    /**
     * Send event to javascript
     * @param eventName Name of the event
     * @param params Additional params
     */
    private void sendEvent(String eventName, @Nullable WritableMap params) {
        if (mReactContext.hasActiveCatalystInstance()) {
            if (D) Log.d(TAG, "Sending event: " + eventName);
            mReactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
        }
    }

    public void onBarcodeEvent(BarcodeReadEvent barcodeReadEvent) {
        if (D) Log.d(TAG, "HONEYWELLSCANNER - Barcode scan read");
        WritableMap params = Arguments.createMap();
        params.putString("data", barcodeReadEvent.getBarcodeData());
        sendEvent(BARCODE_READ_SUCCESS, params);
        try {
            reader.softwareTrigger(true);
        } catch (ScannerNotClaimedException e) {
            e.printStackTrace();
        } catch (ScannerUnavailableException e) {
            e.printStackTrace();
        }
    }

    public void onFailureEvent(BarcodeFailureEvent barcodeFailureEvent) {
        if (D) Log.d(TAG, "HONEYWELLSCANNER - Barcode scan failed");
        sendEvent(BARCODE_READ_FAIL, null);
        try {
            reader.softwareTrigger(false);
        } catch (ScannerNotClaimedException e) {
            e.printStackTrace();
        } catch (ScannerUnavailableException e) {
            e.printStackTrace();
        }
    }

    /*******************************/
    /** Methods Available from JS **/
    /*******************************/

    @ReactMethod
    public void startReader(final Promise promise) {
                Log.e(TAG, " START READER ");

        AidcManager.create(mReactContext, new CreatedCallback() {
            @Override
            public void onCreated(AidcManager aidcManager) {
                manager = aidcManager;
                reader = manager.createBarcodeReader();
                if(reader != null){
                    reader.addBarcodeListener(HoneywellScannerModule.this);
                    try {
                        reader.claim();
                        promise.resolve(true);
                    } catch (ScannerUnavailableException e) {
                        promise.resolve(false);
                        e.printStackTrace();
                    }
                }
            }
        });
    }

    @ReactMethod
    public void readerAvailable(Promise promise) {
        if(manager == null) {
            Log.e(TAG, " NAO TEM MANAGER ");
            promise.resolve(false);
        }
        Log.e(TAG, " TEM MANAGER AQUI");
        promise.resolve(true);
    }

    @ReactMethod
    public void readCode() {

        if(reader == null) {
                    Log.i(TAG, " TESTANDO O INFO ");

            Log.e(TAG, "RC - O reader está nulo! ");
            return;
        }

        try {
            reader.softwareTrigger(false);
            reader.aim(true);
            reader.light(true);
            reader.softwareTrigger(true);
            //promise.resolve(true);
        } catch (ScannerNotClaimedException e) {
            e.printStackTrace();
            //promise.resolve(false);
        } catch (ScannerUnavailableException e) {
            e.printStackTrace();
            //promise.resolve(false);
        }
    }
	
	@ReactMethod
    public void stopReadCode() {
        try {
			if(reader == null) {
                Log.e(TAG, " SRC - O reader está nulo! ");
                return;
            }

			//reader.release();
			//reader.claim();
            reader.aim(false);
            reader.light(false);
            reader.softwareTrigger(false);
            //reader.softwareTrigger(true);
            //promise.resolve(true);
        } catch (ScannerNotClaimedException e) {
            e.printStackTrace();
            //promise.resolve(false);
        } catch (ScannerUnavailableException e) {
            e.printStackTrace();
            //promise.resolve(false);
        }
    }

    @ReactMethod
    public void stopReader(Promise promise) {
        try {
            if (reader != null) {
                reader.close();
            }
            if (manager != null) {
                manager.close();
            }
        } catch (Exception err){
            err.printStackTrace();
        }

        promise.resolve(true);
    }

    private boolean isCompatible() {
        // This... is not optimal. Need to find a better way to performantly check whether device has a Honeywell scanner
        return Build.BRAND.toLowerCase().contains("honeywell");
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("BARCODE_READ_SUCCESS", BARCODE_READ_SUCCESS);
        constants.put("BARCODE_READ_FAIL", BARCODE_READ_FAIL);
        constants.put("isCompatible", isCompatible());
        return constants;
    }
}