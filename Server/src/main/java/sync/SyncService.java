/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sync;

import java.util.Iterator;
import java.util.Set;

/**
 *
 * @author ksinn
 */
public class SyncService {

    private Set<Answerer> answers;

    public Message answer(Message inputMessage) throws Exception {

        Message outputMessage;
        Answerer answer = findAnswer(inputMessage);
        if (answer != null) {
            outputMessage = answer.answer(inputMessage);
        } else {
            outputMessage = new Message(Message.MessageTypes.start_sync);
            ((StatusData) outputMessage.getData()).setCode(500);
            ((StatusData) outputMessage.getData()).setErrorMessage("Unknown message format");
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
