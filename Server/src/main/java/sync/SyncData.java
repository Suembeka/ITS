/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sync;

import entity.Transaction;
import java.util.List;

/**
 *
 * @author ksinn
 */
public class SyncData extends Data{
    protected List<Transaction> transactions;
    
    public List getTransactions() { return transactions; }
    public void setTransactions(List transactions) { this.transactions=transactions; }

}
