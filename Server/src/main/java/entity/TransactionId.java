/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package entity;

import java.io.Serializable;
import javax.validation.constraints.NotNull;
import org.apache.log4j.Logger;

/**
 *
 * @author ksinn
 */
public class TransactionId implements Serializable{
    @NotNull
    private int id;
    @NotNull
    private int transportId;
    
    private static final Logger log = Logger.getLogger(TransactionId.class.getName());
    
    public int getId(){ return id; }
    public int getTransactionId(){ return transportId; }
    public void setId(int id){ this.id = id; }
    public void setTransportId(int transportId){ this.transportId = transportId; }
    
}
