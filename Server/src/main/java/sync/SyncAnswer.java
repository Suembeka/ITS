/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sync;

import static sync.Message.MessageTypes.send_data;

/**
 *
 * @author ksinn
 */
public class SyncAnswer implements Answer{

    @Override
    public boolean canAnswer(Message message) {
        return message.getType().equals(send_data);
    }

    @Override
    public Message answer(Message message) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
}
