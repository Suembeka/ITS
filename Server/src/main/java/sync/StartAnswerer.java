/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sync;

import entity.Transaction;
import entity.Transport;
import hibernate.Factory;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import static sync.Message.MessageTypes.start_sync;

/**
 *
 * @author ksinn
 */
public class StartAnswerer implements Answerer{

    @Override
    public boolean canAnswer(Message message) {
        return message.getType().equals(start_sync);
    }

    @Override
    public Message answer(Message message) {
        Message answer;
        try {
            
            QueryData data = (QueryData) message.getData();
            Transport transport = (Transport) Factory.getInstance().getEntityDAO().getById(Transport.class, data.getTrabsportId());
            if(transport!=null){
                answer = new Message(Message.MessageTypes.accept_sync);
                Transaction transaction = Factory.getInstance().getTransactionDAO().getLastForTransportId(transport.getId());
                if(transaction!=null){
                    ((AcceptData)answer.getData()).setLastTransactionId(transaction.getId().getId());
                } else {
                    ((AcceptData)answer.getData()).setLastTransactionId(0);
                }
            } else {
                answer = new Message(Message.MessageTypes.sync_status);
                ((StatusData)answer.getData()).setCode(500);
                ((StatusData)answer.getData()).setErrorMessage("Unknown transport id!");
            }
            return answer;
        } catch (SQLException ex) {
            Logger.getLogger(StartAnswerer.class.getName()).log(Level.SEVERE, null, ex);
        } catch (Exception ex) {
            Logger.getLogger(StartAnswerer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
}
