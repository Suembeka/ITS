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

public class Message {
    
    enum MessageTypes {start_sync, accept_sync, send_data, sync_status};

    private final String type;
    private Data data;
    
    public Message(MessageTypes type) throws Exception{
        this.type = type.toString();
        data = Data.getInstance(type);
    }
    
    public String getType(){ return type; }
    public Data getData(){ return data; }
}
