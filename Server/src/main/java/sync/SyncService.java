/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sync;

import hibernate.Factory;
import java.util.Iterator;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author ksinn
 */
public class SyncService {

    private Factory factory;
    private Set<Answer> answers;

    public Message answer(Message inputMessage) throws Exception {

        Message outputMessage;
        Answer answer = findAnswer(inputMessage);
        if (answer != null) {
            outputMessage = answer.answer(inputMessage);
        } else {
            outputMessage = new Message(Message.MessageTypes.start_sync);
            ((StatusData) outputMessage.getData()).setCode(500);
            ((StatusData) outputMessage.getData()).setErrorMessage("Unknown message format");
        }
        return outputMessage;

    }

    private Answer findAnswer(Message inputMessage) {
        Iterator<Answer> iterator = answers.iterator();
        while(iterator.hasNext()){
            Answer next = iterator.next();
            if(next.canAnswer(inputMessage)) 
                return next;
        }
        return null;
    }

}
