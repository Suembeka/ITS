/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package entity;

import java.sql.Timestamp;
import java.util.UUID;
import javax.validation.constraints.NotNull;
import org.apache.log4j.Logger;

/**
 *
 * @author ksinn
 */
public class Transaction {
    
    private TransactionId id;
    @NotNull
    private UUID transactionId;
    @NotNull
    private Timestamp time;
    @NotNull
    private Transport transport;
    @NotNull
    private Route route;
    @NotNull
    private Station station;
    @NotNull
    private int cardId;
    @NotNull
    private int cardType;
    private int paymentAmount;
    
    
    private static final Logger log = Logger.getLogger(Transaction.class.getName());
    
    public  TransactionId getId(){ return this.id; }
    public  UUID getTransactionId(){ return this.transactionId; }
    public  Timestamp getTime(){ return this.time; }
    public  Transport getTransport(){ return this.transport; }
    public  Route getRoute(){ return this.route; }
    public  Station getStation(){ return this.station; }
    public  int getCardId(){ return this.cardId; }
    public  int getCardType(){ return this.cardType; }
    public  int getPaymentAmount(){ return this.paymentAmount; }
    public void setId( TransactionId id){ this.id = id; }
    public void setTransactionId( UUID transactionId){ this.transactionId = transactionId; }
    public void setTime( Timestamp time){ this.time = time; }
    public void setTransport( Transport transport){ this.transport = transport; }
    public void setRoute( Route route){ this.route = route; }
    public void setStation( Station station){ this.station = station; }
    public void setCardId( int cardId){ this.cardId = cardId; }
    public void setCardType( int cardType){ this.cardType = cardType; }
    public void setPaymentAmount( int paymentAmount){ this.paymentAmount = paymentAmount; }
    
    
}
