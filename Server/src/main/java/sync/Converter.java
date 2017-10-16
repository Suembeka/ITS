/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sync;

/**
 *
 * @author ksinn
 */
import entity.Route;
import entity.Station;
import entity.Transaction;
import entity.TransactionId;
import entity.Transport;
import hibernate.Factory;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.UUID;
import org.json.JSONArray;
import org.json.JSONObject;
import sync.Message.MessageTypes;
import static sync.Message.MessageTypes.*;

public class Converter {

    public static JSONObject toJSON(Message mess) throws Exception {
        JSONObject json = new JSONObject();
        json.put("type", mess.getType());
        JSONObject data = new JSONObject();
        
        switch (mess.getType()) {
            case accept_sync: {
                DataAccept d = (DataAccept) mess.getData();
                data.put("last_tranaction_id", d.getLastTransactionId());
                break;
            }
            case sync_status: {
                DataStatus d = (DataStatus) mess.getData();
                data.put("staus", d.getCode());
                data.put("err", d.getErrorMessage());
                break;
            }
            default: {
                throw new Exception("Error message format");
            }
        }
        
        json.put("data", data);
        return json;
    }

    public static Message toJavaObject(JSONObject json) throws Exception {
        switch (json.getString("type")) {
            case "start_sync": {
                Message mes = new Message(MessageTypes.start_sync);
                DataStart data = (DataStart) mes.getData();
                data.setTransportId(json.getJSONObject("data").getInt("transport_id"));
                return mes;
            }
            case "send_data": {
                Message mes = new Message(MessageTypes.send_data);

                JSONArray transactionsJson = json.getJSONObject("data").getJSONArray("transactions");
                ArrayList<Transaction> transactions = new ArrayList<Transaction>();
                Iterator<Object> iterator = transactionsJson.iterator();
                while (iterator.hasNext()) {
                    JSONObject tJson = (JSONObject) iterator.next();
                    Transaction t = new Transaction();
                    t.setTransactionId(UUID.fromString(tJson.getString("transaction_id")));
                    t.setCardId(tJson.getInt("card_id"));
                    t.setCardType(tJson.getInt("card_type"));
                    TransactionId id = new TransactionId();
                        id.setId(tJson.getInt("id"));
                        id.setTransportId(tJson.getInt("transport_id"));
                    t.setId(id);
                    t.setPaymentAmount(tJson.getInt("payment_amount"));
                    t.setRoute((Route) Factory.getInstance().getEntityDAO().getById(Route.class, tJson.getInt("route_id")));
                    t.setStation((Station) Factory.getInstance().getEntityDAO().getById(Station.class, tJson.getInt("station_id")));
                    t.setTime(new Timestamp(tJson.getLong("time")));
                    t.setTransport((Transport) Factory.getInstance().getEntityDAO().getById(Route.class, tJson.getInt("transport_id")));                   
                    transactions.add(t);
                }
                DataSended data = (DataSended) mes.getData();
                data.setTransactions(transactions);
                return mes;
            }
            default: {
                throw new Exception("Error message format");
            }
        }
    }

}
