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
public class DataAccept extends Data{
    protected int lastTransactionId;
    
    public DataAccept(){}    
    
    public int getLastTransactionId(){ return  lastTransactionId; }
    public void setLastTransactionId(int lastTransactionId){ this.lastTransactionId=lastTransactionId; }
}
