/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package statictics;

/**
 *
 * @author ksinn
 */
import org.json.JSONArray;
import org.json.JSONObject;

public class Converter {

    public static JSONObject toJSON(Statictics stat) {
        JSONObject json = new JSONObject();
        json.put("status", "ok");
        json.put("error", "");
        JSONObject data = new JSONObject();
            data.put("passangers", stat.getPassangers());
            data.put("travels", stat.getTravels());
            data.put("money", stat.getMoney());
            data.put("totalPassengers", stat.getTotalPassangers());
            data.put("totalTravels", stat.getTotalTravels());
            data.put("totalMoney", stat.getTotalMoney());
        json.put("data", data);
        
        return json;
    }
    
    public static JSONObject toJSON(String error) {
        JSONObject json = new JSONObject();
        json.put("status", "error");
        json.put("error", error);
               
        return json;
    }

    public static JSONObject toJSON(Fugure fugure) {
        JSONObject json = new JSONObject();
        json.put("status", "ok");
        json.put("error", "");
        JSONArray data = new JSONArray();
        for(int i=0; i<fugure.getSize(); i++){
            JSONObject point = new JSONObject();
            point.put("point", fugure.getPoint(i).getPoint());
            point.put("value", fugure.getPoint(i).getValue());
            data.put(point);
        }
        json.put("data", data);
        
        return json;
    }

    

}
