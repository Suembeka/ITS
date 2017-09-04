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
public abstract class Data {
    static Data getInstance(Message.MessageTypes type) throws Exception{
        switch (type){
            case accept_sync: return new AcceptData();
            case start_sync: return new QueryData();
            case send_data: return new SyncData();
            case sync_status: return new StatusData();
            default: throw new Exception("Unknown type");
        }
    }
}
