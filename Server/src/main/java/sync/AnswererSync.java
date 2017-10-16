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
import java.util.List;
import static sync.Message.MessageTypes.send_data;
import static sync.Message.MessageTypes.sync_status;
import static sync.SyncSession.State.send_last_id;
import static sync.SyncSession.State.send_sync_status;
import static sync.SyncSession.State.take_data;

/**
 *
 * @author ksinn
 */
public class AnswererSync implements Answerer{
    
    private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(Answerer.class.getName());

    @Override
    public boolean canAnswer(Message message) {
        return message.getType().equals(send_data)
                &&message.getSession().getCurrentState()==take_data;
    }

    @Override
    public Message answer(Message message) throws Exception {
        try {
            Message answer = new Message(sync_status);
            DataSended data = (DataSended) message.getData();
            try{
                Factory.getInstance().getTransactionDAO().addAll(data.getTransactions());
                ((DataStatus)answer.getData()).setCode(200);
            } catch(SQLException ex){
                ((DataStatus)answer.getData()).setCode(500);
                ((DataStatus)answer.getData()).setErrorMessage("Can not save transactions!");
            }
            return answer;
        } catch (Exception ex) {
            log.error("StartAnswerer error!", ex);
            throw ex;
        }
    }
    
}
