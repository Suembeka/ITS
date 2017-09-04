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
public class StatusData extends Data{
    protected int code;
    protected String errorMessage;
    
    public int getCode(){ return code; }
    public String getErrorMessage(){ return errorMessage; }
    public void setCode(int code){ this.code = code; }
    public void setErrorMessage(String errorMessage){ this.errorMessage = errorMessage; }
}
