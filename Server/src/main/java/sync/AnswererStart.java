/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sync;

import entity.Transaction;
import entity.Transport;
import hibernate.Factory;
import static sync.Message.MessageTypes.start_sync;
import static sync.SyncSession.State.opened;

/**
 *
 * @author ksinn
 */
public class AnswererStart implements Answerer{
    
    private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(Answerer.class.getName());

    @Override
    public boolean canAnswer(Message message) {
        return message.getType().equals(start_sync)
                &&message.getSession().getCurrentState()==opened;
    }

    @Override
    public Message answer(Message message) throws Exception{
        Message answer;
        try {
            
            DataStart data = (DataStart) message.getData();
            Transport transport = (Transport) Factory.getInstance().getEntityDAO().getById(Transport.class, data.getTrabsportId());
            if(transport!=null){
                answer = new Message(Message.MessageTypes.accept_sync);
                Transaction transaction = Factory.getInstance().getTransactionDAO().getLastForTransportId(transport.getId());
                if(transaction!=null){
                    ((DataAccept)answer.getData()).setLastTransactionId(transaction.getId().getId());
                } else {
                    ((DataAccept)answer.getData()).setLastTransactionId(0);
                }
            } else {
                answer = new Message(Message.MessageTypes.sync_status);
                ((DataStatus)answer.getData()).setCode(400);
                ((DataStatus)answer.getData()).setErrorMessage("Unknown transport id!");
            }
            return answer;
        } catch (Exception ex) {
            log.error("StartAnswerer error!", ex);
            throw ex;
        }
    }
    
}
