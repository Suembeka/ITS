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
public interface Answerer {
    public boolean canAnswer(Message message);
    public Message answer(Message message);
    
}
