/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package statictics;

/**
 *
 * @author ksinn
 */
public class Statictics {

    private long pass;
    private long trav;
    private long money;
    private long totalT;
    private long totalM;
    private long totalP;

    long getPassangers() {
        return pass;
    }

    long getTravels() {
        return trav;
    }

    long getMoney() {
        return money;
    }

    public void setPassangers(long aLong) {
        this.pass = aLong;
    }

    public void setMoney(long aLong) {
        this.money = aLong;
    }

    public void setTraveles(long aLong) {
        this.trav = aLong;
    }

    public void setTotalPassangers(long aLong) {
        this.totalP = aLong;
    }

    public void setTotalMoney(long aLong) {
        this.totalM = aLong;
    }

    public void setTotalTraveles(long aLong) {
        this.totalT = aLong;
    }

    long getTotalPassangers() {
        return this.totalP;
    }

    long getTotalTravels() {
        return this.totalT;
    }

    long getTotalMoney() {
        return this.totalM; 
    }

}
