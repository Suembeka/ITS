package sync;

import junit.framework.TestCase;
import static sync.Message.MessageTypes.accept_sync;
import static sync.Message.MessageTypes.sync_status;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 *
 * @author ksinn
 */
public class TestStartAnswer extends TestCase {

    Answerer answerer = new AnswererStart();

    public void testToAnswer() throws Exception {

        //Normal sync
        Message mes = new Message(Message.MessageTypes.start_sync);
        ((DataStart) mes.getData()).setTransportId(1);

        if (answerer.canAnswer(mes)) {
            Message answer = answerer.answer(mes);
            if (!answer.getType().equals(accept_sync)) {
                throw new Exception("error type normal. type is " + answer.getType());
            }
        } else {
            throw new Exception("Error answer");
        }

        //Uncnown transport id
        mes = new Message(Message.MessageTypes.start_sync);
        ((DataStart) mes.getData()).setTransportId(9999);
        if (answerer.canAnswer(mes)) {
            Message answer = answerer.answer(mes);

            if (!answer.getType().equals(sync_status)) {
                throw new Exception("error type in unknown id. type is " + answer.getType());
            }
            if (((DataStatus) answer.getData()).getCode() != 400) {
                throw new Exception("error code");
            }
            if (!((DataStatus) answer.getData()).getErrorMessage().equals("Unknown transport id!")) {
                throw new Exception("error message");
            }
        } else {
            throw new Exception("Error answer");
        }

    }

}
