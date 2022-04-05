package code.btv.greenup;

import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.gson.Gson;

import java.io.FileInputStream;
import java.util.List;

public class Main {

    static void init() throws Exception{
        FileInputStream serviceAccount =
                new FileInputStream("serviceAccountKey.json");

        FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setDatabaseUrl("https://greenupvermont-de02b.firebaseio.com")
                .build();

        FirebaseApp.initializeApp(options);
    }

    public static void main(String[] args) throws Exception{
        init();

        Gson gson = new Gson();

        Firestore db = FirestoreClient.getFirestore();

        // asynchronously retrieve multiple documents
        ApiFuture<QuerySnapshot> future = db.collection("trashDrops").get();//.whereEqualTo("location.townId", "CLARENDON").get();
        // future.get() blocks on response
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        for (DocumentSnapshot document : documents) {
            System.out.println(gson.toJson(document.getData()));
            //System.out.println(document.getId() + " => " + gson.toJson(document.getData()));
        }

    }
}
