/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sync;


import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 *
 * @author ksinn
 */
public class SyncService {

    private Set<Answerer> answers;
    
    {
        answers = new HashSet();
    }
        

    public void setAnswerer(Answerer answer){
        answers.add(answer);
    }
    
    public Message answer(Message inputMessage) throws Exception {

        Message outputMessage;
        Answerer answer = findAnswer(inputMessage);
        if (answer != null) {
            outputMessage = answer.answer(inputMessage);
        } else {
            outputMessage = new Message(Message.MessageTypes.sync_status);
            ((DataStatus) outputMessage.getData()).setCode(400);
            ((DataStatus) outputMessage.getData()).setErrorMessage("Unknown message format or bad session!");
        }
        return outputMessage;

    }

    private Answerer findAnswer(Message inputMessage) {
        Iterator<Answerer> iterator = answers.iterator();
        while(iterator.hasNext()){
            Answerer next = iterator.next();
            if(next.canAnswer(inputMessage)) 
                return next;
        }
        return null;
    }

}
