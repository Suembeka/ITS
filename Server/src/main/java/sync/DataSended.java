/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sync;

import entity.Transaction;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author ksinn
 */
public class DataSended extends Data{
    
    protected List<Transaction> transactions;
    
    {
        transactions = new ArrayList();
    }
    
    public DataSended(){}
    
    public List getTransactions() { return transactions; }
    public void setTransactions(List transactions) { this.transactions = transactions==null?this.transactions:transactions; }

}
