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
public class DataStart extends Data{
    
    protected int transportId;
    
    public DataStart(){}
    
    public int getTrabsportId(){ return  transportId; }
    public void setTransportId(int transportId){ this.transportId = transportId; }
    
}
